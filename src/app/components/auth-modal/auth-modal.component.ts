import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, UserRole } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html'
})
export class AuthModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  mode: AuthMode = 'login';
  fullName = '';
  email = '';
  password = '';
  selectedRole: UserRole = 'customer';
  loading = false;

  constructor(
    private supabaseService: SupabaseService,
    private toastService: ToastService
  ) {}

  getButtonText(): string {
    if (this.mode === 'login') return 'Sign In to Account';
    if (this.mode === 'register') return `Register as ${this.selectedRole.toUpperCase()}`;
    return 'Send Password Recovery Email';
  }

  getButtonIcon(): string {
    if (this.mode === 'login') return 'ri-login-box-line';
    if (this.mode === 'register') return 'ri-user-add-line';
    return 'ri-mail-send-line';
  }

  async onSubmit() {
    if (!this.email) return;
    this.loading = true;

    try {
      if (this.mode === 'login') {
        await this.supabaseService.signIn(this.email, this.password);
        const role = this.supabaseService.getUserRole();
        this.toastService.success('Welcome Back!', `Signed in as [${role.toUpperCase()}] ${this.email}`);
        this.close.emit();
      } else if (this.mode === 'register') {
        await this.supabaseService.signUp(this.email, this.password, this.fullName, this.selectedRole);
        this.toastService.success('Account Created', `Registered successfully as ${this.selectedRole.toUpperCase()}!`);
        this.close.emit();
      } else if (this.mode === 'forgot') {
        await this.supabaseService.resetPassword(this.email);
        this.close.emit();
      }
    } catch (err: any) {
      this.toastService.error('Authentication Error', err.message || 'Error executing auth action');
    } finally {
      this.loading = false;
    }
  }
}
