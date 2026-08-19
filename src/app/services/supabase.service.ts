import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { Product, Category } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';
import { ToastService } from './toast.service';

export type UserRole = 'admin' | 'customer';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface ServiceInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: 'catering' | 'workshop' | 'wholesale' | 'subscription' | 'general';
  message: string;
  createdAt: string;
}

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Signature Espresso', slug: 'espresso', icon: 'ri-cup-line' },
  { id: 'cat-2', name: 'Cold Brew & Ice', slug: 'cold-brew', icon: 'ri-goblet-line' },
  { id: 'cat-3', name: 'Matcha & Artisanal Teas', slug: 'teas', icon: 'ri-leaf-line' },
  { id: 'cat-4', name: 'Fresh Bakery & Pastries', slug: 'bakery', icon: 'ri-cake-3-line' },
  { id: 'cat-5', name: 'Single Origin Beans', slug: 'beans', icon: 'ri-plant-line' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'AURA Velvet Vanilla Latte',
    description: 'Double shot of signature espresso infused with Madagascar vanilla bean syrup and micro-foamed oat milk.',
    price: 5.80,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewCount: 142,
    roastLevel: 'Medium',
    tags: ['Bestseller', 'Oat Milk'],
    isAvailable: true,
    isFeatured: true,
    customization: {
      sizes: [{ label: 'Small (8oz)', priceExtra: 0 }, { label: 'Medium (12oz)', priceExtra: 0.60 }, { label: 'Large (16oz)', priceExtra: 1.20 }],
      milkChoices: [{ label: 'Whole Milk', priceExtra: 0 }, { label: 'Oat Milk', priceExtra: 0.70 }, { label: 'Almond Milk', priceExtra: 0.70 }, { label: 'Coconut Milk', priceExtra: 0.80 }],
      sweetnessLevels: ['Unsweetened (0%)', 'Subtle (25%)', 'Balanced (50%)', 'Sweet (100%)'],
      temperatures: ['Hot', 'Iced'],
      extraShotPrice: 1.00
    }
  },
  {
    id: 'prod-2',
    categoryId: 'cat-1',
    name: 'Smokey Smoked Honey Cappuccino',
    description: 'Rich dark espresso topped with velvety foam and drizzled with raw smoked wildflower honey & cinnamon.',
    price: 6.20,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewCount: 98,
    roastLevel: 'Dark',
    tags: ['Chef Special', 'Artisanal'],
    isAvailable: true,
    isFeatured: true,
    customization: {
      sizes: [{ label: 'Small (8oz)', priceExtra: 0 }, { label: 'Medium (12oz)', priceExtra: 0.60 }, { label: 'Large (16oz)', priceExtra: 1.20 }],
      milkChoices: [{ label: 'Whole Milk', priceExtra: 0 }, { label: 'Oat Milk', priceExtra: 0.70 }, { label: 'Almond Milk', priceExtra: 0.70 }],
      sweetnessLevels: ['Unsweetened (0%)', 'Balanced (50%)', 'Sweet (100%)'],
      temperatures: ['Hot'],
      extraShotPrice: 1.00
    }
  },
  {
    id: 'prod-3',
    categoryId: 'cat-2',
    name: 'Nitro Cloud Cold Brew',
    description: '24-hour steep cold brew infused with pure nitrogen gas, crowned with sweet vanilla salted cream foam.',
    price: 6.50,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    rating: 4.95,
    reviewCount: 210,
    roastLevel: 'Omni',
    tags: ['Nitrogen Draft', 'Cream Top'],
    isAvailable: true,
    isFeatured: true,
    customization: {
      sizes: [{ label: 'Medium (12oz)', priceExtra: 0 }, { label: 'Large (16oz)', priceExtra: 0.90 }],
      milkChoices: [{ label: 'Standard Foam', priceExtra: 0 }, { label: 'Oat Foam', priceExtra: 0.80 }],
      sweetnessLevels: ['Unsweetened (0%)', 'Balanced (50%)', 'Sweet (100%)'],
      temperatures: ['Iced'],
      extraShotPrice: 1.00
    }
  },
  {
    id: 'prod-4',
    categoryId: 'cat-3',
    name: 'Kyoto Ceremonial Uji Matcha Latte',
    description: 'First-harvest ceremonial Grade A matcha whisked with warm almond milk and subtle agave nectar.',
    price: 6.80,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800',
    rating: 4.88,
    reviewCount: 86,
    tags: ['Antioxidant Boost', 'Organic'],
    isAvailable: true,
    isFeatured: true,
    customization: {
      sizes: [{ label: 'Small (8oz)', priceExtra: 0 }, { label: 'Medium (12oz)', priceExtra: 0.60 }, { label: 'Large (16oz)', priceExtra: 1.20 }],
      milkChoices: [{ label: 'Oat Milk', priceExtra: 0 }, { label: 'Almond Milk', priceExtra: 0 }, { label: 'Coconut Milk', priceExtra: 0.50 }],
      sweetnessLevels: ['Unsweetened (0%)', 'Balanced (50%)', 'Sweet (100%)'],
      temperatures: ['Hot', 'Iced'],
      extraShotPrice: 1.50
    }
  },
  {
    id: 'prod-5',
    categoryId: 'cat-4',
    name: 'Artisanal Butter Croissant',
    description: 'Flaky 81-layer French butter croissant baked fresh daily with organic flour.',
    price: 4.50,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
    rating: 4.92,
    reviewCount: 310,
    tags: ['Baked Fresh Daily'],
    isAvailable: true,
    isFeatured: false,
    customization: {
      sizes: [{ label: 'Standard', priceExtra: 0 }],
      milkChoices: [],
      sweetnessLevels: [],
      temperatures: ['Warm Up', 'As Is'],
      extraShotPrice: 0
    }
  }
];

const INITIAL_MOCK_ORDERS: Order[] = [];

const INITIAL_INQUIRIES: ServiceInquiry[] = [
  {
    id: 'INQ-101',
    name: 'Eleanor Vance',
    email: 'eleanor@designstudio.co',
    phone: '+1 415-555-0188',
    serviceType: 'catering',
    message: 'Looking for a mobile espresso bar catering setup for our 50-person corporate anniversary event on Friday.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  public isLiveSupabase = false;

  private currentUserSubject = new BehaviorSubject<AppUser | null>(this.loadStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<Category[]>(this.loadStoredCategories());
  public categories$ = this.categoriesSubject.asObservable();

  private productsSubject = new BehaviorSubject<Product[]>(INITIAL_PRODUCTS);
  public products$ = this.productsSubject.asObservable();

  private ordersSubject = new BehaviorSubject<Order[]>(this.loadStoredOrders());
  public orders$ = this.ordersSubject.asObservable();

  private inquiriesSubject = new BehaviorSubject<ServiceInquiry[]>(INITIAL_INQUIRIES);
  public inquiries$ = this.inquiriesSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.initSupabase();
  }

  private loadStoredOrders(): Order[] {
    try {
      const saved = localStorage.getItem('aura_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.filter(o => o.id !== 'ORD-9821');
      }
    } catch (err) {}
    return INITIAL_MOCK_ORDERS;
  }

  private saveOrders(orders: Order[]) {
    this.ordersSubject.next(orders);
    try {
      localStorage.setItem('aura_orders', JSON.stringify(orders));
    } catch (err) {}
  }

  saveLocalPlacedOrderId(orderId: string) {
    try {
      const saved = this.getLocalPlacedOrderIds();
      if (!saved.includes(orderId)) {
        saved.unshift(orderId);
        localStorage.setItem('aura_my_order_ids', JSON.stringify(saved));
      }
    } catch (err) {}
  }

  getLocalPlacedOrderIds(): string[] {
    try {
      const saved = localStorage.getItem('aura_my_order_ids');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return [];
  }

  private loadStoredCategories(): Category[] {
    try {
      const saved = localStorage.getItem('aura_categories');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return MOCK_CATEGORIES;
  }

  private saveCategories(categories: Category[]) {
    this.categoriesSubject.next(categories);
    try {
      localStorage.setItem('aura_categories', JSON.stringify(categories));
    } catch (err) {}
  }

  private loadStoredUser(): AppUser | null {
    try {
      const saved = localStorage.getItem('aura_user');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return null;
  }

  private setUser(user: AppUser | null) {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
      // Save to user roles map
      const rolesMap = this.getRolesMap();
      rolesMap[user.email.toLowerCase()] = user.role;
      localStorage.setItem('aura_user_roles', JSON.stringify(rolesMap));
    } else {
      localStorage.removeItem('aura_user');
    }
  }

  private getRolesMap(): Record<string, UserRole> {
    try {
      const saved = localStorage.getItem('aura_user_roles');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return {
      'admin@auracoffee.com': 'admin',
      'customer@auracoffee.com': 'customer'
    };
  }

  private async initSupabase() {
    if (
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.url !== 'https://your-supabase-project.supabase.co' &&
      SUPABASE_CONFIG.anonKey &&
      SUPABASE_CONFIG.anonKey !== 'your-supabase-anon-key'
    ) {
      try {
        this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.isLiveSupabase = true;

        // Check active session on startup
        const { data: sessionData } = await this.supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const u = sessionData.session.user;
          const email = u.email || '';
          let role: UserRole = (email.toLowerCase().includes('admin') ? 'admin' : 'customer');
          let fullName = u.user_metadata?.['full_name'] || email.split('@')[0] || '';

          try {
            const { data: profile } = await this.supabase.from('profiles').select('*').eq('id', u.id).single();
            if (profile?.role) role = profile.role as UserRole;
            if (profile?.full_name) fullName = profile.full_name;
          } catch (e) {}

          this.setUser({ id: u.id, email, fullName, role });
        }

        // Listen to Auth State Changes
        this.supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const email = session.user.email || '';
            let role: UserRole = session.user.user_metadata?.['role'] || (email.toLowerCase().includes('admin') ? 'admin' : 'customer');
            let fullName = session.user.user_metadata?.['full_name'] || email.split('@')[0] || '';

            if (this.supabase) {
              try {
                const { data: profile } = await this.supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single();
                if (profile?.role) role = profile.role as UserRole;
                if (profile?.full_name) fullName = profile.full_name;
              } catch (e) {}
            }

            this.setUser({
              id: session.user.id,
              email,
              fullName,
              role
            });
          }
        });

        // Sync live data and attach real-time listeners
        await this.syncDataFromSupabase();
        this.setupRealtimeListeners();
      } catch (err) {
        console.warn('[AURA] Supabase client init note:', err);
      }
    }
  }

  private async syncDataFromSupabase() {
    if (!this.supabase) return;

    try {
      // 1. Fetch Categories from Supabase
      const { data: dbCategories, error: catErr } = await this.supabase.from('categories').select('*').order('name');
      if (dbCategories && dbCategories.length > 0) {
        this.categoriesSubject.next(dbCategories);
        localStorage.setItem('aura_categories', JSON.stringify(dbCategories));
      }

      // 2. Fetch Products from Supabase
      const { data: dbProducts, error: prodErr } = await this.supabase.from('products').select('*');
      if (dbProducts && dbProducts.length > 0) {
        const mappedProducts: Product[] = dbProducts.map(p => ({
          id: p.id,
          categoryId: p.category_id || p.categoryId || 'cat-1',
          name: p.name,
          description: p.description || '',
          price: Number(p.price) || 5.0,
          imageUrl: p.image_url || p.imageUrl || '',
          rating: Number(p.rating) || 4.9,
          reviewCount: Number(p.review_count) || 50,
          roastLevel: p.roast_level || p.roastLevel || 'Medium',
          tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : ['Bestseller']),
          isAvailable: p.is_available !== false,
          isFeatured: !!p.is_featured,
          customization: p.customization ? (typeof p.customization === 'string' ? JSON.parse(p.customization) : p.customization) : {
            sizes: [{ label: 'Small (8oz)', priceExtra: 0 }, { label: 'Medium (12oz)', priceExtra: 0.60 }, { label: 'Large (16oz)', priceExtra: 1.20 }],
            milkChoices: [{ label: 'Whole Milk', priceExtra: 0 }, { label: 'Oat Milk', priceExtra: 0.70 }],
            sweetnessLevels: ['Unsweetened (0%)', 'Balanced (50%)', 'Sweet (100%)'],
            temperatures: ['Hot', 'Iced'],
            extraShotPrice: 1.00
          }
        }));
        this.productsSubject.next(mappedProducts);
      }

      // 3. Fetch Orders from Supabase
      const { data: dbOrders, error: orderErr } = await this.supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (dbOrders) {
        const mappedOrders: Order[] = dbOrders.map(o => ({
          id: o.id,
          userId: o.user_id || o.userId,
          customerEmail: o.customer_email || o.customerEmail,
          customerName: o.customer_name || o.customerName || 'Valued Guest',
          customerPhone: o.customer_phone || o.customerPhone || '',
          orderType: o.order_type || o.orderType || 'pickup',
          deliveryAddress: o.delivery_address || o.deliveryAddress,
          items: Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []),
          subtotal: Number(o.subtotal) || 0,
          tax: Number(o.tax) || 0,
          discount: Number(o.discount) || 0,
          totalAmount: Number(o.total_amount || o.totalAmount) || 0,
          status: o.status || 'pending',
          createdAt: o.created_at || o.createdAt || new Date().toISOString()
        }));
        this.ordersSubject.next(mappedOrders);
        localStorage.setItem('aura_orders', JSON.stringify(mappedOrders));
      }
    } catch (err) {
      console.warn('[AURA] Supabase sync note:', err);
    }
  }

  private setupRealtimeListeners() {
    if (!this.supabase) return;

    try {
      this.supabase
        .channel('public:orders_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
          if (payload.eventType === 'INSERT') {
            const o = payload.new as any;
            const newOrder: Order = {
              id: o.id,
              userId: o.user_id || o.userId,
              customerEmail: o.customer_email || o.customerEmail,
              customerName: o.customer_name || o.customerName || 'Valued Guest',
              customerPhone: o.customer_phone || o.customerPhone || '',
              orderType: o.order_type || o.orderType || 'pickup',
              deliveryAddress: o.delivery_address || o.deliveryAddress,
              items: Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []),
              subtotal: Number(o.subtotal) || 0,
              tax: Number(o.tax) || 0,
              discount: Number(o.discount) || 0,
              totalAmount: Number(o.total_amount || o.totalAmount) || 0,
              status: o.status || 'pending',
              createdAt: o.created_at || o.createdAt || new Date().toISOString()
            };
            const current = this.ordersSubject.value;
            if (!current.some(e => e.id === newOrder.id)) {
              this.ordersSubject.next([newOrder, ...current]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const o = payload.new as any;
            const updated = this.ordersSubject.value.map(existing => {
              if (existing.id === o.id) {
                return {
                  ...existing,
                  status: o.status || existing.status,
                  customerName: o.customer_name || existing.customerName,
                  customerPhone: o.customer_phone || existing.customerPhone,
                  totalAmount: Number(o.total_amount) || existing.totalAmount
                };
              }
              return existing;
            });
            this.ordersSubject.next(updated);
          } else if (payload.eventType === 'DELETE') {
            const o = payload.old as any;
            this.ordersSubject.next(this.ordersSubject.value.filter(e => e.id !== o.id));
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('[AURA] Realtime subscription note:', err);
    }
  }

  // Getters for Auth Guard & Roles
  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): UserRole {
    return this.currentUserSubject.value?.role || 'customer';
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  // Resilient Authentication Methods with Supabase Auth & Database Sync
  async signUp(email: string, password: string, fullName: string, role: UserRole = 'customer') {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        const userObject: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName || email.split('@')[0],
          role
        };

        try {
          await this.supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            full_name: userObject.fullName,
            role: role
          });
        } catch (e) {}

        this.setUser(userObject);
        return { user: userObject };
      }
    }

    const localUser: AppUser = {
      id: 'usr-' + Date.now(),
      email,
      fullName: fullName || email.split('@')[0],
      role
    };
    this.setUser(localUser);
    return { user: localUser };
  }

  async signIn(email: string, password: string) {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        let role: UserRole = (data.user.user_metadata?.['role'] as UserRole) || (email.toLowerCase().includes('admin') ? 'admin' : 'customer');
        let fullName = data.user.user_metadata?.['full_name'] || email.split('@')[0];

        try {
          const { data: profile } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            if (profile['role']) role = profile['role'] as UserRole;
            if (profile['full_name']) fullName = profile['full_name'];
          } else {
            await this.supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: role
            });
          }
        } catch (e) {}

        const userObject: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          role
        };

        this.setUser(userObject);
        return { user: userObject };
      }
    }

    const rolesMap = this.getRolesMap();
    const userRole: UserRole = rolesMap[email.toLowerCase()] || (email.toLowerCase().includes('admin') ? 'admin' : 'customer');
    const localUser: AppUser = {
      id: 'usr-' + Date.now(),
      email,
      fullName: email.split('@')[0],
      role: userRole
    };
    this.setUser(localUser);
    return { user: localUser };
  }

  async resetPassword(email: string) {
    if (this.supabase) {
      try {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/admin'
        });
        if (error) throw new Error(error.message);
      } catch (err: any) {
        throw new Error(err.message || 'Password reset failed');
      }
    }
    this.toastService.success('Reset Email Sent', `Password recovery link sent to ${email}`);
  }

  async signOut() {
    if (this.supabase) {
      try {
        await this.supabase.auth.signOut();
      } catch (err) {}
    }
    this.setUser(null);
    this.toastService.info('Signed Out', 'Logged out successfully.');
  }

  // Category & Product Methods
  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  addCategory(category: Partial<Category>) {
    const slug = category.slug || (category.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name: category.name || 'New Category',
      slug: slug || 'category',
      icon: category.icon || 'ri-cup-line'
    };

    const current = [...this.categoriesSubject.value, newCategory];
    this.saveCategories(current);
    this.toastService.success('Category Added', `${newCategory.name} created successfully.`);

    if (this.supabase) {
      this.supabase.from('categories').insert({
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        icon: newCategory.icon
      }).then();
    }
  }

  updateCategory(updated: Category) {
    const current = this.categoriesSubject.value.map(c => c.id === updated.id ? updated : c);
    this.saveCategories(current);
    this.toastService.success('Category Updated', `${updated.name} updated.`);

    if (this.supabase) {
      this.supabase.from('categories').update({
        name: updated.name,
        slug: updated.slug,
        icon: updated.icon
      }).eq('id', updated.id).then();
    }
  }

  deleteCategory(categoryId: string) {
    const cat = this.categoriesSubject.value.find(c => c.id === categoryId);
    const current = this.categoriesSubject.value.filter(c => c.id !== categoryId);
    this.saveCategories(current);
    this.toastService.info('Category Deleted', `${cat?.name || 'Category'} removed.`);

    if (this.supabase) {
      this.supabase.from('categories').delete().eq('id', categoryId).then();
    }
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // Product CRUD Operations
  addProduct(product: Partial<Product>) {
    const newProduct: Product = {
      id: 'prod-' + Math.floor(100 + Math.random() * 900),
      categoryId: product.categoryId || 'cat-1',
      name: product.name || 'Untitled Coffee',
      description: product.description || '',
      price: product.price || 5.00,
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
      rating: 5.0,
      reviewCount: 1,
      roastLevel: product.roastLevel || 'Medium',
      tags: product.tags || ['Specialty'],
      isAvailable: product.isAvailable !== false,
      isFeatured: product.isFeatured || false,
      customization: {
        sizes: [{ label: 'Small (8oz)', priceExtra: 0 }, { label: 'Medium (12oz)', priceExtra: 0.60 }, { label: 'Large (16oz)', priceExtra: 1.20 }],
        milkChoices: [{ label: 'Whole Milk', priceExtra: 0 }, { label: 'Oat Milk', priceExtra: 0.70 }],
        sweetnessLevels: ['Unsweetened (0%)', 'Balanced (50%)', 'Sweet (100%)'],
        temperatures: ['Hot', 'Iced'],
        extraShotPrice: 1.00
      }
    };

    const current = [newProduct, ...this.productsSubject.value];
    this.productsSubject.next(current);
    this.toastService.success('Product Added', `${newProduct.name} created successfully.`);

    if (this.supabase) {
      this.supabase.from('products').insert({
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image_url: newProduct.imageUrl,
        category_id: newProduct.categoryId,
        roast_level: newProduct.roastLevel,
        is_available: newProduct.isAvailable,
        is_featured: newProduct.isFeatured
      }).then();
    }
  }

  updateProduct(updated: Product) {
    const current = this.productsSubject.value.map(p => p.id === updated.id ? updated : p);
    this.productsSubject.next(current);
    this.toastService.success('Product Updated', `${updated.name} updated.`);

    if (this.supabase) {
      this.supabase.from('products').update({
        name: updated.name,
        price: updated.price,
        description: updated.description,
        image_url: updated.imageUrl,
        is_available: updated.isAvailable,
        is_featured: updated.isFeatured
      }).eq('id', updated.id).then();
    }
  }

  deleteProduct(productId: string) {
    const prod = this.productsSubject.value.find(p => p.id === productId);
    const current = this.productsSubject.value.filter(p => p.id !== productId);
    this.productsSubject.next(current);
    this.toastService.info('Product Deleted', `${prod?.name || 'Item'} removed from catalog.`);

    if (this.supabase) {
      this.supabase.from('products').delete().eq('id', productId).then();
    }
  }

  toggleProductAvailability(productId: string) {
    const current = this.productsSubject.value.map(p => {
      if (p.id === productId) {
        const nextState = !p.isAvailable;
        this.toastService.info('Stock Status', `${p.name} set to ${nextState ? 'IN STOCK' : 'OUT OF STOCK'}`);
        return { ...p, isAvailable: nextState };
      }
      return p;
    });
    this.productsSubject.next(current);
  }

  // Orders Management
  createOrder(orderData: Partial<Order>): Observable<Order> {
    const user = this.currentUserSubject.value;
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId: user?.id || orderData.userId,
      customerEmail: user?.email || orderData.customerEmail,
      customerName: orderData.customerName || user?.fullName || 'Valued Guest',
      customerPhone: orderData.customerPhone || '',
      orderType: orderData.orderType || 'pickup',
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const currentOrders = [newOrder, ...this.ordersSubject.value];
    this.saveOrders(currentOrders);
    this.saveLocalPlacedOrderId(newOrder.id);

    if (this.supabase) {
      this.supabase.from('orders').insert({
        id: newOrder.id,
        user_id: newOrder.userId || null,
        customer_email: newOrder.customerEmail || null,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        order_type: newOrder.orderType,
        delivery_address: newOrder.deliveryAddress || null,
        items: JSON.stringify(newOrder.items),
        subtotal: newOrder.subtotal,
        tax: newOrder.tax,
        discount: newOrder.discount,
        total_amount: newOrder.totalAmount,
        status: newOrder.status,
        created_at: newOrder.createdAt
      }).then(({ error: orderError }) => {
        if (newOrder.items && newOrder.items.length > 0) {
          const itemRows = newOrder.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.product?.id || 'prod-custom',
            quantity: item.quantity || 1,
            unit_price: item.unitPrice || 0,
            selected_size: item.customization?.size || 'Standard'
          }));

          this.supabase?.from('order_items').insert(itemRows).then(({ error: itemsErr }) => {
            if (itemsErr) {
              console.warn('[AURA] order_items table insert note:', itemsErr.message);
            }
          });
        }
      });
    }

    return of(newOrder);
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const updated = this.ordersSubject.value.map(o => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    this.saveOrders(updated);
    this.toastService.success('Order Status Changed', `Order ${orderId} status set to ${status.toUpperCase()}`);

    if (this.supabase) {
      this.supabase.from('orders').update({ status }).eq('id', orderId).then();
    }
  }

  // Service Inquiries
  submitInquiry(inquiry: Omit<ServiceInquiry, 'id' | 'createdAt'>) {
    const newInquiry: ServiceInquiry = {
      ...inquiry,
      id: 'INQ-' + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString()
    };
    this.inquiriesSubject.next([newInquiry, ...this.inquiriesSubject.value]);
    this.toastService.success('Inquiry Received', 'Thank you! Our coffee event team will reach out within 24 hours.');
  }
}
