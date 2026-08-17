import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-product-crud-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-crud-modal.component.html'
})
export class ProductCrudModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Product>>();

  formData: Partial<Product> = {
    name: '',
    price: 5.50,
    categoryId: 'cat-1',
    description: '',
    imageUrl: '',
    roastLevel: 'Medium',
    isAvailable: true,
    isFeatured: false
  };

  tagsString = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.product) {
      this.formData = { ...this.product };
      this.tagsString = (this.product.tags || []).join(', ');
    } else {
      this.formData = {
        name: '',
        price: 5.50,
        categoryId: 'cat-1',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
        roastLevel: 'Medium',
        isAvailable: true,
        isFeatured: false
      };
      this.tagsString = 'Bestseller, Organic';
    }
  }

  onSubmit() {
    const tags = this.tagsString.split(',').map(t => t.trim()).filter(Boolean);
    this.save.emit({
      ...this.formData,
      tags
    });
    this.close.emit();
  }
}
