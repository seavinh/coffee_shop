import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { SupabaseService } from '../../services/supabase.service';
import { CurrencyService } from '../../services/currency.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroComponent, ProductCardComponent, ProductModalComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  featuredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  currentUser$ = this.supabaseService.currentUser$;
  activeOrdersCount = 0;
  totalProductsCount = 0;

  constructor(
    private supabaseService: SupabaseService,
    public currencyService: CurrencyService
  ) {
    this.supabaseService.getProducts().subscribe(products => {
      this.featuredProducts = products.filter(p => p.isFeatured && p.isAvailable);
      this.totalProductsCount = products.length;
    });

    this.supabaseService.orders$.subscribe(orders => {
      this.activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    });
  }

  get dynamicGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️ Freshly Brewed Espresso awaits!';
    if (hour < 18) return 'Good Afternoon ☕ Recharge with Signature Cold Brew!';
    return 'Good Evening 🌙 Relax with Organic Herbal Infusions!';
  }

  scrollToFeatured() {
    const el = document.getElementById('featured-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
