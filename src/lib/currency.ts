export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'GHS' | 'KES' | 'ZAR';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateFromNGN: number; // Approximate conversion factor from 1 NGN
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateFromNGN: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromNGN: 0.00065 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromNGN: 0.00052 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromNGN: 0.00060 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateFromNGN: 0.010 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateFromNGN: 0.085 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateFromNGN: 0.012 },
};

/**
 * Convert a base NGN price into a clean localized amount for the target currency
 */
export function convertFromNGN(ngnAmount: number, currency: SupportedCurrency = 'NGN'): number {
  if (currency === 'NGN') return ngnAmount;
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.NGN;
  const raw = ngnAmount * config.rateFromNGN;

  // Clean psychological pricing rounding for foreign currencies
  if (currency === 'USD' || currency === 'GBP' || currency === 'EUR') {
    return Math.max(1, Number(raw.toFixed(2)));
  }
  return Math.max(10, Math.ceil(raw / 5) * 5);
}

/**
 * Format an amount with its currency symbol
 */
export function formatCurrencyAmount(amount: number, currency: SupportedCurrency = 'NGN'): string {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.NGN;
  const isDecimal = currency === 'USD' || currency === 'GBP' || currency === 'EUR';
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: isDecimal && amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: isDecimal ? 2 : 0,
  });
  return `${config.symbol}${formatted}`;
}
