import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  showModal = false;
  form = {
    name: '',
    email: '',
    phone: '',
    serviceType: 'catering' as any,
    message: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  openInquiryModal(type: any) {
    this.form.serviceType = type;
    this.showModal = true;
  }

  submitInquiry() {
    if (!this.form.name || !this.form.email) return;
    this.supabaseService.submitInquiry({
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      serviceType: this.form.serviceType,
      message: this.form.message
    });
    this.showModal = false;
    this.form = { name: '', email: '', phone: '', serviceType: 'catering', message: '' };
  }
}
