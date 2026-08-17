import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  name = '';
  email = '';
  subject = 'General Inquiry';
  message = '';

  constructor(
    private supabaseService: SupabaseService,
    private toastService: ToastService
  ) {}

  sendMessage() {
    if (!this.name || !this.email || !this.message) return;
    this.supabaseService.submitInquiry({
      name: this.name,
      email: this.email,
      phone: '',
      serviceType: 'general',
      message: `[Subject: ${this.subject}] ${this.message}`
    });
    this.toastService.success('Message Sent', 'Thank you! We will get back to you shortly.');
    this.name = '';
    this.email = '';
    this.message = '';
  }
}
