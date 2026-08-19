import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';
import { CurrencyService } from '../../services/currency.service';
import { OrderType } from '../../models/order.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-drawer.component.html'
})
export class CartDrawerComponent {
  isOpen$ = this.cartService.isDrawerOpen$;
  items: any[] = [];
  subtotal = 0;
  tax = 0;
  total = 0;
  cartItemCount = 0;

  orderType: OrderType = 'pickup';
  customerName = '';
  customerPhone = '';
  deliveryAddress = '';

  constructor(
    private cartService: CartService,
    private supabaseService: SupabaseService,
    private toastService: ToastService,
    public currencyService: CurrencyService,
    private router: Router
  ) {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.subtotal = this.cartService.getSubtotal();
      this.tax = this.cartService.getTax();
      this.total = this.cartService.getTotal();
      this.cartItemCount = this.cartService.getItemCount();
    });

    this.supabaseService.currentUser$.subscribe(u => {
      if (u) {
        this.customerName = u.fullName || u.email?.split('@')[0] || '';
      }
    });
  }

  closeDrawer() {
    this.cartService.toggleDrawer(false);
  }

  updateQuantity(id: string, change: number) {
    this.cartService.updateQuantity(id, change);
  }

  removeItem(id: string) {
    this.cartService.removeItem(id);
  }

  onSubmitOrder() {
    if (!this.customerName.trim()) {
      this.toastService.error('Name Required', 'Please provide a name for the order.');
      return;
    }
    if (this.orderType === 'delivery' && !this.deliveryAddress.trim()) {
      this.toastService.error('Address Required', 'Please specify a delivery address.');
      return;
    }

    this.supabaseService.createOrder({
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      orderType: this.orderType,
      deliveryAddress: this.deliveryAddress,
      items: this.items,
      subtotal: this.subtotal,
      tax: this.tax,
      totalAmount: this.total
    }).subscribe(newOrder => {
      this.toastService.success('Order Confirmed!', `Your order ${newOrder.id} has been submitted.`);
      this.cartService.clearCart();
      this.closeDrawer();
      this.router.navigate(['/orders']);
    });
  }
}
