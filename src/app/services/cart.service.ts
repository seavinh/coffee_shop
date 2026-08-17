import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, SelectedCustomization } from '../models/order.model';
import { Product } from '../models/product.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private isDrawerOpenSubject = new BehaviorSubject<boolean>(false);
  public isDrawerOpen$ = this.isDrawerOpenSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.loadFromStorage();
  }

  toggleDrawer(open?: boolean) {
    if (open !== undefined) {
      this.isDrawerOpenSubject.next(open);
    } else {
      this.isDrawerOpenSubject.next(!this.isDrawerOpenSubject.value);
    }
  }

  addToCart(product: Product, customization: SelectedCustomization, quantity: number = 1) {
    const unitPrice = product.price + customization.sizePriceExtra + customization.milkPriceExtra + customization.extraShotsPriceExtra;
    const totalPrice = unitPrice * quantity;

    const cartItemId = `${product.id}-${customization.size}-${customization.milk}-${customization.sweetness}-${customization.temperature}-${customization.extraShots}`;
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => i.id === cartItemId);

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += quantity;
      currentItems[existingIndex].totalPrice = currentItems[existingIndex].quantity * currentItems[existingIndex].unitPrice;
    } else {
      currentItems.push({
        id: cartItemId,
        product,
        quantity,
        customization,
        unitPrice,
        totalPrice
      });
    }

    this.itemsSubject.next(currentItems);
    this.saveToStorage();
    this.toastService.success('Added to Order', `${product.name} has been added to your cart.`);
    this.toggleDrawer(true);
  }

  updateQuantity(cartItemId: string, change: number) {
    let currentItems = [...this.itemsSubject.value];
    const item = currentItems.find(i => i.id === cartItemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      currentItems = currentItems.filter(i => i.id !== cartItemId);
    } else {
      item.totalPrice = item.quantity * item.unitPrice;
    }

    this.itemsSubject.next(currentItems);
    this.saveToStorage();
  }

  removeItem(cartItemId: string) {
    const updated = this.itemsSubject.value.filter(i => i.id !== cartItemId);
    this.itemsSubject.next(updated);
    this.saveToStorage();
    this.toastService.info('Item Removed', 'Item removed from your order cart.');
  }

  clearCart() {
    this.itemsSubject.next([]);
    this.saveToStorage();
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  getItemCount(): number {
    return this.itemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  private saveToStorage() {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(this.itemsSubject.value));
    } catch (e) {}
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('aura_cart');
      if (stored) {
        this.itemsSubject.next(JSON.parse(stored));
      }
    } catch (e) {}
  }
}
