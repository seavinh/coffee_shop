-- =========================================================
-- AURA ARTISAN COFFEE SHOP DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor to initialize tables!
-- =========================================================

-- 1. Create Profiles Table (Syncs with Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'barista', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'ri-cup-line'
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviewCount INT DEFAULT 0,
  roast_level TEXT,
  tags TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  customization_json JSONB
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  order_type TEXT DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  selected_size TEXT,
  selected_milk TEXT,
  sweetness_level TEXT,
  temperature TEXT,
  extra_shots INT DEFAULT 0,
  special_notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);

-- Enable Supabase Realtime for live order status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Seed Data: Categories
INSERT INTO public.categories (id, name, slug, icon) VALUES
  ('cat-1', 'Signature Espresso', 'espresso', 'ri-cup-line'),
  ('cat-2', 'Cold Brew & Ice', 'cold-brew', 'ri-goblet-line'),
  ('cat-3', 'Matcha & Artisanal Teas', 'teas', 'ri-leaf-line'),
  ('cat-4', 'Fresh Bakery & Pastries', 'bakery', 'ri-cake-3-line'),
  ('cat-5', 'Single Origin Beans', 'beans', 'ri-plant-line')
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Products
INSERT INTO public.products (id, category_id, name, description, price, image_url, rating, reviewCount, roast_level, tags, is_available, is_featured) VALUES
  ('prod-1', 'cat-1', 'AURA Velvet Vanilla Latte', 'Double shot signature espresso with Madagascar vanilla bean & oat milk.', 5.80, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800', 4.90, 142, 'Medium', ARRAY['Bestseller', 'Oat Milk'], true, true),
  ('prod-2', 'cat-1', 'Smokey Smoked Honey Cappuccino', 'Rich dark espresso topped with foam & smoked wildflower honey.', 6.20, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800', 4.80, 98, 'Dark', ARRAY['Chef Special'], true, true),
  ('prod-3', 'cat-2', 'Nitro Cloud Cold Brew', '24-hour steep cold brew with nitrogen draft & vanilla cream foam.', 6.50, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800', 4.95, 210, 'Omni', ARRAY['Nitrogen Draft'], true, true),
  ('prod-4', 'cat-3', 'Kyoto Ceremonial Uji Matcha Latte', 'First-harvest Grade A matcha whisked with almond milk & agave.', 6.80, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800', 4.88, 86, NULL, ARRAY['Organic'], true, true),
  ('prod-5', 'cat-4', 'Artisanal Butter Croissant', 'Flaky 81-layer French butter croissant baked fresh daily.', 4.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800', 4.92, 310, NULL, ARRAY['Baked Fresh Daily'], true, false)
ON CONFLICT (id) DO NOTHING;
