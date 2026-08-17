import { Product } from './product.model';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'pickup' | 'delivery';

export interface SelectedCustomization {
  size: string;
  sizePriceExtra: number;
  milk: string;
  milkPriceExtra: number;
  sweetness: string;
  temperature: string;
  extraShots: number;
  extraShotsPriceExtra: number;
  specialNotes?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customization: SelectedCustomization;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
