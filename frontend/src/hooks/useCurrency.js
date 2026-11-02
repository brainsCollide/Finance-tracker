import { useAuthStore } from "../stores/auth.store";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatMoney,
  formatCompactMoney,
} from "../utils/currency";

export const useCurrency = () => {
  const stored = useAuthStore((s) => s.user?.currency);
  const code = CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;

  return {
    code,
    symbol: CURRENCIES[code].symbol,
    format: (amount) => formatMoney(amount, code),
    formatCompact: (amount) => formatCompactMoney(amount, code),
  };
};