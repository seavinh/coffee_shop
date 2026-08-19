import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../models/order.model';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-modal.component.html'
})
export class ReceiptModalComponent {
  @Input() isOpen = false;
  @Input() order: Order | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(public currencyService: CurrencyService) {}

  printReceipt() {
    window.print();
  }
}
