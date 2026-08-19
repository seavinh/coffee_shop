import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { SupabaseService } from '../../services/supabase.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ProductModalComponent],
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategory = 'all';
  selectedTag = 'all';
  searchQuery = '';
  selectedProduct: Product | null = null;

  availableTags = ['All', 'Bestseller', 'Oat Milk', 'Chef Special', 'Nitrogen Draft', 'Organic'];

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.getCategories().subscribe(c => this.categories = c);
    this.supabaseService.getProducts().subscribe(p => this.products = p);
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'all' || p.categoryId === this.selectedCategory;
      const matchTag = this.selectedTag === 'all' || p.tags.some(t => t.toLowerCase() === this.selectedTag.toLowerCase());
      const matchSearch = !this.searchQuery || 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchCat && matchTag && matchSearch;
    });
  }

  isTagSelected(tag: string): boolean {
    return (this.selectedTag === 'all' && tag === 'All') || this.selectedTag.toLowerCase() === tag.toLowerCase();
  }
}
