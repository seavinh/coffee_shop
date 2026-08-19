import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SupabaseService } from '../../services/supabase.service';
import { CurrencyService, CURRENCY_OPTIONS, CurrencyOption } from '../../services/currency.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  @Output() openAuth = new EventEmitter<void>();
  cartItemCount = 0;
  user$ = this.supabaseService.currentUser$;
  isAdmin = false;

  currencyOptions = CURRENCY_OPTIONS;
  activeCurrency$ = this.currencyService.currentCurrency$;

  constructor(
    private cartService: CartService,
    private supabaseService: SupabaseService,
    public currencyService: CurrencyService
  ) {
    this.cartService.items$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.supabaseService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }

  onCurrencyChange(event: any) {
    const code = event.target.value;
    this.currencyService.setCurrency(code);
  }

  toggleCart() {
    this.cartService.toggleDrawer();
  }

  onSignOut() {
    this.supabaseService.signOut();
  }
}
