import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { ContactComponent } from './pages/contact/contact.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'AURA | Artisan Coffee & Roastery' },
  { path: 'menu', component: MenuComponent, title: 'AURA | Coffee & Pastry Menu' },
  { path: 'about', component: AboutComponent, title: 'AURA | Our Craft & Heritage' },
  { path: 'services', component: ServicesComponent, title: 'AURA | Catering & Roastery Services' },
  { path: 'contact', component: ContactComponent, title: 'AURA | Contact Us & Location' },
  { path: 'orders', component: OrdersComponent, title: 'AURA | Track Your Order' },
  { path: 'admin', component: AdminComponent, title: 'AURA | Admin Operations Center' },
  { path: '**', redirectTo: '' }
];
