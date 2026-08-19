import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService, UserRole } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  currentUser$ = this.supabaseService.currentUser$;
  activeRoleTab: UserRole = 'customer';
  authMode: 'login' | 'register' = 'login';
  
  fullName = '';
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private supabaseService: SupabaseService,
    private toastService: ToastService,
    private router: Router
  ) {}

  onSignOut() {
    this.supabaseService.signOut();
  }

  async onSubmit() {
    if (!this.email) return;
    this.loading = true;
    this.errorMsg = '';

    try {
      if (this.authMode === 'login') {
        const res = await this.supabaseService.signIn(this.email, this.password);
        const role = res.user?.role || this.supabaseService.getUserRole();

        this.toastService.success(
          'Welcome Back',
          `Signed in as ${res.user?.fullName || this.email}`
        );

        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/menu']);
        }
      } else {
        await this.supabaseService.signUp(this.email, this.password, this.fullName, this.activeRoleTab);
        this.toastService.success(
          'Account Created',
          `Registered as ${this.activeRoleTab.toUpperCase()}`
        );

        if (this.activeRoleTab === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/menu']);
        }
      }
    } catch (err: any) {
      this.errorMsg = err.message || 'Authentication error';
    } finally {
      this.loading = false;
    }
  }
}
