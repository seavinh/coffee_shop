import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(title: string, message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  success(title: string, message: string) {
    this.show(title, message, 'success');
  }

  error(title: string, message: string) {
    this.show(title, message, 'error');
  }

  info(title: string, message: string) {
    this.show(title, message, 'info');
  }

  dismiss(id: string) {
    const current = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(current);
  }
}
