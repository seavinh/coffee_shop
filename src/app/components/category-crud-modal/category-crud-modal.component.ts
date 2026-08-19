import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-crud-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-crud-modal.component.html'
})
export class CategoryCrudModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() category: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Category>>();

  formData: Partial<Category> = {
    name: '',
    slug: '',
    icon: 'ri-cup-line'
  };

  presetIcons = [
    { label: 'Cup', icon: 'ri-cup-line' },
    { label: 'Goblet', icon: 'ri-goblet-line' },
    { label: 'Tea Leaf', icon: 'ri-leaf-line' },
    { label: 'Bakery', icon: 'ri-cake-3-line' },
    { label: 'Beans', icon: 'ri-plant-line' },
    { label: 'Flame', icon: 'ri-fire-line' },
    { label: 'Sparkle', icon: 'ri-sparkling-line' },
    { label: 'Drink', icon: 'ri-drinks-line' },
    { label: 'Food', icon: 'ri-restaurant-line' },
    { label: 'Heart', icon: 'ri-heart-line' },
    { label: 'Star', icon: 'ri-star-line' },
    { label: 'Store', icon: 'ri-store-2-line' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.category) {
      this.formData = { ...this.category };
    } else {
      this.formData = {
        name: '',
        slug: '',
        icon: 'ri-cup-line'
      };
    }
  }

  onNameChange() {
    if (!this.category && this.formData.name) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  selectIcon(iconClass: string) {
    this.formData.icon = iconClass;
  }

  onSubmit() {
    if (!this.formData.name) return;
    if (!this.formData.slug) {
      this.formData.slug = this.formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    this.save.emit({ ...this.formData });
    this.close.emit();
  }
}
