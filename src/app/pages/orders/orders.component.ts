import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SupabaseService, AppUser } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { ToastService } from '../../services/toast.service';
import { ReceiptModalComponent } from '../../components/receipt-modal/receipt-modal.component';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReceiptModalComponent],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  currentUser: AppUser | null = null;
  isAdmin = false;
  
  searchQuery = '';
  selectedStatus: 'all' | OrderStatus = 'all';
  activeTab: 'my' | 'all' = 'my';

  isReceiptOpen = false;
  selectedReceiptOrder: Order | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService,
    private toastService: ToastService,
    public currencyService: CurrencyService,
    private route: ActivatedRoute
  ) {
    this.supabaseService.orders$.subscribe(o => this.orders = o);
    this.supabaseService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.isAdmin = u?.role === 'admin';
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchQuery = params['id'];
      }
    });
  }

  get myOrders(): Order[] {
    const localIds = this.supabaseService.getLocalPlacedOrderIds();
    return this.orders.filter(o => {
      if (this.currentUser) {
        const matchUser = o.userId === this.currentUser.id;
        const matchEmail = !!o.customerEmail && o.customerEmail.toLowerCase() === this.currentUser.email.toLowerCase();
        const matchLocal = localIds.includes(o.id);
        return matchUser || matchEmail || matchLocal;
      }
      return localIds.includes(o.id);
    });
  }

  get displayedOrders(): Order[] {
    const q = this.searchQuery.trim().toLowerCase();
    
    // Base pool of orders depending on active tab or user role
    let pool: Order[];
    if (this.isAdmin && this.activeTab === 'all') {
      pool = this.orders;
    } else {
      pool = this.myOrders;
      // If customer has a search query and nothing matched in myOrders, also check all orders (e.g. tracking by ID or phone)
      if (q && pool.length === 0) {
        pool = this.orders;
      }
    }

    return pool.filter(order => {
      const matchSearch = !q || 
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(q)) ||
        order.items.some(i => i.product.name.toLowerCase().includes(q));

      const matchStatus = this.selectedStatus === 'all' || order.status === this.selectedStatus;

      return matchSearch && matchStatus;
    });
  }

  reorder(order: Order) {
    if (!order.items || order.items.length === 0) return;
    for (const item of order.items) {
      this.cartService.addToCart(item.product, item.customization, item.quantity);
    }
    this.toastService.success('Order Items Added', `Added items from ${order.id} to your cart.`);
  }

  getStepClass(status: OrderStatus, stepNumber: number): string {
    const statusMap: Record<OrderStatus, number> = {
      pending: 1,
      preparing: 2,
      ready: 3,
      completed: 4,
      cancelled: 0
    };
    const currentStep = statusMap[status] || 1;

    if (currentStep >= stepNumber) {
      return 'bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/30';
    }
    return 'bg-white/5 text-cream-muted border-white/10';
  }

  getStepTextClass(status: OrderStatus, stepNumber: number): string {
    const statusMap: Record<OrderStatus, number> = {
      pending: 1,
      preparing: 2,
      ready: 3,
      completed: 4,
      cancelled: 0
    };
    const currentStep = statusMap[status] || 1;

    if (currentStep >= stepNumber) {
      return 'text-amber-400 font-extrabold';
    }
    return 'text-cream-muted font-normal';
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'preparing': return 'bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse';
      case 'ready': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'cancelled': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-white/10 text-cream border-white/20';
    }
  }

  openReceipt(order: Order) {
    this.selectedReceiptOrder = order;
    this.isReceiptOpen = true;
  }
}
