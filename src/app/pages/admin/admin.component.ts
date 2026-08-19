import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, ServiceInquiry } from '../../services/supabase.service';
import { CurrencyService } from '../../services/currency.service';
import { ProductCrudModalComponent } from '../../components/product-crud-modal/product-crud-modal.component';
import { CategoryCrudModalComponent } from '../../components/category-crud-modal/category-crud-modal.component';
import { ReceiptModalComponent } from '../../components/receipt-modal/receipt-modal.component';
import { Order, OrderStatus } from '../../models/order.model';
import { Product, Category } from '../../models/product.model';

type AdminTab = 'orders' | 'products' | 'categories' | 'inquiries';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ProductCrudModalComponent, CategoryCrudModalComponent, ReceiptModalComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  activeTab: AdminTab = 'orders';
  orders: Order[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  inquiries: ServiceInquiry[] = [];

  isCrudModalOpen = false;
  editingProduct: Product | null = null;

  isCategoryModalOpen = false;
  editingCategory: Category | null = null;

  isReceiptOpen = false;
  selectedReceiptOrder: Order | null = null;

  constructor(
    private supabaseService: SupabaseService,
    public currencyService: CurrencyService
  ) {
    this.supabaseService.orders$.subscribe(o => this.orders = o);
    this.supabaseService.getProducts().subscribe(p => this.products = p);
    this.supabaseService.getCategories().subscribe(c => this.categories = c);
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
    const cat = this.categories.find(c => c.id === catId);
    return cat ? cat.name : 'Beverage';
  }

  getProductCountByCategory(catId: string): number {
    return this.products.filter(p => p.categoryId === catId).length;
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

  // Category Management CRUD
  openAddCategoryModal() {
    this.editingCategory = null;
    this.isCategoryModalOpen = true;
  }

  openEditCategoryModal(category: Category) {
    this.editingCategory = category;
    this.isCategoryModalOpen = true;
  }

  handleSaveCategory(categoryData: Partial<Category>) {
    if (this.editingCategory) {
      this.supabaseService.updateCategory({ ...this.editingCategory, ...categoryData } as Category);
    } else {
      this.supabaseService.addCategory(categoryData);
    }
  }

  deleteCategory(id: string) {
    const attachedCount = this.getProductCountByCategory(id);
    const msg = attachedCount > 0
      ? `This category currently has ${attachedCount} product(s) attached. Are you sure you want to delete it?`
      : 'Are you sure you want to delete this category?';
    if (confirm(msg)) {
      this.supabaseService.deleteCategory(id);
    }
  }

  openReceipt(order: Order) {
    this.selectedReceiptOrder = order;
    this.isReceiptOpen = true;
  }
}
