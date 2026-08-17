import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SupabaseService } from '../../services/supabase.service';

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

  constructor(
    private cartService: CartService,
    private supabaseService: SupabaseService
  ) {
    this.cartService.items$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  toggleCart() {
    this.cartService.toggleDrawer();
  }

  onSignOut() {
    this.supabaseService.signOut();
  }
}
