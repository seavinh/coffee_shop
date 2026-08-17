import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { SupabaseService } from '../../services/supabase.service';
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

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.getProducts().subscribe(products => {
      this.featuredProducts = products.filter(p => p.isFeatured);
    });
  }

  scrollToFeatured() {
    const el = document.getElementById('featured-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
