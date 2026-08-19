import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrencyOption {
  code: 'USD' | 'EUR' | 'GBP' | 'KHR';
  symbol: string;
  rate: number; // Rate relative to USD
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', rate: 0.78, label: 'GBP (£)' },
  { code: 'KHR', symbol: '៛', rate: 4100, label: 'KHR (៛)' }
];

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrencySubject = new BehaviorSubject<CurrencyOption>(CURRENCY_OPTIONS[0]);
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  setCurrency(code: 'USD' | 'EUR' | 'GBP' | 'KHR') {
    const found = CURRENCY_OPTIONS.find(c => c.code === code) || CURRENCY_OPTIONS[0];
    this.currentCurrencySubject.next(found);
  }

  getCurrency(): CurrencyOption {
    return this.currentCurrencySubject.value;
  }

  formatPrice(amountInUSD: number): string {
    const cur = this.currentCurrencySubject.value;
    const converted = amountInUSD * cur.rate;
    if (cur.code === 'KHR') {
      return `${Math.round(converted).toLocaleString()} ${cur.symbol}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  }
}
