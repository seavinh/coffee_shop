import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'error': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'ri-checkbox-circle-fill';
      case 'error': return 'ri-error-warning-fill';
      case 'warning': return 'ri-alert-fill';
      default: return 'ri-information-fill';
    }
  }
}
