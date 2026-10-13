import { create } from 'zustand';

export type CurrencyCode = 'USD' | 'NGN' | 'EUR' | 'GBP';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUSD: number; // 1 USD = rate units of target currency
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', rateFromUSD: 1 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)', rateFromUSD: 1500 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', rateFromUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', rateFromUSD: 0.79 },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'USD',
  setCurrency: (code: CurrencyCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCurrency', code);
    }
    set({ currency: code });
  },
  formatPrice: (amountInUSD: number) => {
    const currentCode = get().currency;
    const curr = CURRENCIES[currentCode] || CURRENCIES.USD;
    const converted = amountInUSD * curr.rateFromUSD;
    
    if (currentCode === 'NGN') {
      return `₦${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  }
}));
