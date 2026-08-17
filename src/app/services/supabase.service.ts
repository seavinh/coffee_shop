import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { Product, Category } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';
import { ToastService } from './toast.service';

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
  },
  {
    id: 'prod-6',
    categoryId: 'cat-4',
    name: 'Dark Chocolate Almond Danish',
    description: 'Decadent Belgian dark chocolate folded into crisp puff pastry with toasted sliced almonds.',
    price: 5.20,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    rating: 4.75,
    reviewCount: 64,
    tags: ['Sweet Treat'],
    isAvailable: true,
    isFeatured: false,
    customization: {
      sizes: [{ label: 'Standard', priceExtra: 0 }],
      milkChoices: [],
      sweetnessLevels: [],
      temperatures: ['Warm Up', 'As Is'],
      extraShotPrice: 0
    }
  },
  {
    id: 'prod-7',
    categoryId: 'cat-5',
    name: 'Ethiopia Yirgacheffe Single Origin (250g)',
    description: 'Washed Arabica coffee bean featuring notes of jasmine floral aroma, bergamot citrus, and bright lemon clarity.',
    price: 18.50,
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&q=80&w=800',
    rating: 4.98,
    reviewCount: 52,
    roastLevel: 'Light',
    tags: ['Whole Bean', 'Floral & Citrus'],
    isAvailable: true,
    isFeatured: true
  }
];

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-9821',
    customerName: 'Sophie Bennett',
    customerPhone: '+1 415-555-0192',
    orderType: 'pickup',
    items: [
      {
        id: 'item-1',
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        customization: {
          size: 'Medium (12oz)',
          sizePriceExtra: 0.60,
          milk: 'Oat Milk',
          milkPriceExtra: 0.70,
          sweetness: 'Balanced (50%)',
          temperature: 'Hot',
          extraShots: 1,
          extraShotsPriceExtra: 1.00,
          specialNotes: 'Extra hot please!'
        },
        unitPrice: 8.10,
        totalPrice: 16.20
      }
    ],
    subtotal: 16.20,
    tax: 1.30,
    discount: 0,
    totalAmount: 17.50,
    status: 'preparing',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private productsSubject = new BehaviorSubject<Product[]>(INITIAL_PRODUCTS);
  public products$ = this.productsSubject.asObservable();

  private ordersSubject = new BehaviorSubject<Order[]>(INITIAL_MOCK_ORDERS);
  public orders$ = this.ordersSubject.asObservable();

  private inquiriesSubject = new BehaviorSubject<ServiceInquiry[]>(INITIAL_INQUIRIES);
  public inquiries$ = this.inquiriesSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.initSupabase();
  }

  private initSupabase() {
    if (
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.url !== 'https://your-supabase-project.supabase.co' &&
      SUPABASE_CONFIG.anonKey &&
      SUPABASE_CONFIG.anonKey !== 'your-supabase-anon-key'
    ) {
      try {
        this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.isLiveSupabase = true;
        console.log('[AURA] Connected to live Supabase.');

        this.supabase.auth.onAuthStateChange((_event, session) => {
          this.currentUserSubject.next(session?.user || null);
        });
      } catch (err) {
        console.warn('[AURA] Supabase client init failed, running mock mode.', err);
        this.isLiveSupabase = false;
      }
    } else {
      console.log('[AURA] Running in offline mock mode.');
    }
  }

  // Authentication Methods
  async signUp(email: string, password: string, fullName: string) {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      return data;
    } else {
      const mockUser: any = { id: 'usr-' + Date.now(), email, user_metadata: { full_name: fullName } };
      this.currentUserSubject.next(mockUser);
      return { user: mockUser };
    }
  }

  async signIn(email: string, password: string) {
    if (this.supabase) {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      const mockUser: any = { id: 'usr-admin-1', email, user_metadata: { full_name: email.split('@')[0] } };
      this.currentUserSubject.next(mockUser);
      return { user: mockUser };
    }
  }

  async resetPassword(email: string) {
    if (this.supabase) {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin'
      });
      if (error) throw error;
    }
    this.toastService.success('Reset Email Sent', `Password recovery link sent to ${email}`);
  }

  async signOut() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    this.currentUserSubject.next(null);
    this.toastService.info('Signed Out', 'Logged out successfully.');
  }

  // Category & Product Methods
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES);
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
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      userId: this.currentUserSubject.value?.id,
      customerName: orderData.customerName || 'Valued Guest',
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
    this.ordersSubject.next(currentOrders);

    if (this.supabase) {
      this.supabase.from('orders').insert({
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        order_type: newOrder.orderType,
        delivery_address: newOrder.deliveryAddress,
        total_amount: newOrder.totalAmount,
        status: newOrder.status
      }).then();
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
    this.ordersSubject.next(updated);
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
