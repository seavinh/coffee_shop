import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule,
    NavbarComponent, 
    CartDrawerComponent, 
    AuthModalComponent, 
    ToastComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  isAuthModalOpen = false;
}
