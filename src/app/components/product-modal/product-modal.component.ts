import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { SelectedCustomization } from '../../models/order.model';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();

  selectedSize: any = null;
  selectedMilk: any = null;
  selectedSweetness: string = '';
  selectedTemperature: string = '';
  extraShots: number = 0;
  specialNotes: string = '';
  quantity: number = 1;

  constructor(private cartService: CartService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.resetDefaults();
    }
  }

  resetDefaults() {
    if (!this.product) return;
    const cust = this.product.customization;
    this.selectedSize = cust?.sizes?.[0] || { label: 'Standard', priceExtra: 0 };
    this.selectedMilk = cust?.milkChoices?.[0] || { label: 'Whole Milk', priceExtra: 0 };
    this.selectedSweetness = cust?.sweetnessLevels?.[0] || 'Standard';
    this.selectedTemperature = cust?.temperatures?.[0] || 'Hot';
    this.extraShots = 0;
    this.specialNotes = '';
    this.quantity = 1;
  }

  changeShots(delta: number) {
    this.extraShots = Math.max(0, this.extraShots + delta);
  }

  mathMax(a: number, b: number): number {
    return Math.max(a, b);
  }

  calculateTotalPrice(): number {
    if (!this.product) return 0;
    const base = this.product.price;
    const sizeExtra = this.selectedSize?.priceExtra || 0;
    const milkExtra = this.selectedMilk?.priceExtra || 0;
    const shotsExtra = (this.product.customization?.extraShotPrice || 0) * this.extraShots;
    return (base + sizeExtra + milkExtra + shotsExtra) * this.quantity;
  }

  onAddToCart() {
    if (!this.product) return;

    const customization: SelectedCustomization = {
      size: this.selectedSize?.label || 'Standard',
      sizePriceExtra: this.selectedSize?.priceExtra || 0,
      milk: this.selectedMilk?.label || 'None',
      milkPriceExtra: this.selectedMilk?.priceExtra || 0,
      sweetness: this.selectedSweetness,
      temperature: this.selectedTemperature,
      extraShots: this.extraShots,
      extraShotsPriceExtra: (this.product.customization?.extraShotPrice || 0) * this.extraShots,
      specialNotes: this.specialNotes
    };

    this.cartService.addToCart(this.product, customization, this.quantity);
    this.close.emit();
  }
}
