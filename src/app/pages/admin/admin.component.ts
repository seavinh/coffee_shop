import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, ServiceInquiry } from '../../services/supabase.service';
import { ProductCrudModalComponent } from '../../components/product-crud-modal/product-crud-modal.component';
import { Order, OrderStatus } from '../../models/order.model';
import { Product } from '../../models/product.model';

type AdminTab = 'orders' | 'products' | 'inquiries';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ProductCrudModalComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  activeTab: AdminTab = 'orders';
  orders: Order[] = [];
  products: Product[] = [];
  inquiries: ServiceInquiry[] = [];

  isCrudModalOpen = false;
  editingProduct: Product | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.orders$.subscribe(o => this.orders = o);
    this.supabaseService.getProducts().subscribe(p => this.products = p);
    this.supabaseService.inquiries$.subscribe(i => this.inquiries = i);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(o => o.status === status);
  }

  get readyAndCompletedOrders(): Order[] {
    return [...this.getOrdersByStatus('ready'), ...this.getOrdersByStatus('completed')];
  }

  get pendingCount(): number {
    return this.getOrdersByStatus('pending').length;
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }

  getCategoryName(catId: string): string {
    switch (catId) {
      case 'cat-1': return 'Espresso';
      case 'cat-2': return 'Cold Brew';
      case 'cat-3': return 'Teas';
      case 'cat-4': return 'Bakery';
      case 'cat-5': return 'Beans';
      default: return 'Beverage';
    }
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    this.supabaseService.updateOrderStatus(orderId, status);
  }

  toggleStock(productId: string) {
    this.supabaseService.toggleProductAvailability(productId);
  }

  openAddProductModal() {
    this.editingProduct = null;
    this.isCrudModalOpen = true;
  }

  openEditProductModal(product: Product) {
    this.editingProduct = product;
    this.isCrudModalOpen = true;
  }

  handleSaveProduct(productData: Partial<Product>) {
    if (this.editingProduct) {
      this.supabaseService.updateProduct({ ...this.editingProduct, ...productData } as Product);
    } else {
      this.supabaseService.addProduct(productData);
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this coffee item from the catalog?')) {
      this.supabaseService.deleteProduct(id);
    }
  }
}
