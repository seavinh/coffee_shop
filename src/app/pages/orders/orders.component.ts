import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent {
  orders: Order[] = [];

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.orders$.subscribe(o => this.orders = o);
  }

  getStepIndex(status: OrderStatus): number {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  }

  getStepClass(status: OrderStatus, step: number): string {
    const current = this.getStepIndex(status);
    if (current >= step) {
      return 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20';
    }
    return 'bg-white/5 text-cream-muted border-white/10';
  }

  getStepTextClass(status: OrderStatus, step: number): string {
    const current = this.getStepIndex(status);
    return current >= step ? 'text-amber-400' : 'text-cream-muted';
  }
}
