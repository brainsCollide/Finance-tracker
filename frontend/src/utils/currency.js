export const CURRENCIES = {
  IDR: { locale: "id-ID", symbol: "Rp", decimals: 0 },
  TRY: { locale: "tr-TR", symbol: "₺", decimals: 2 },
  USD: { locale: "en-US", symbol: "$", decimals: 2 },
};

export const DEFAULT_CURRENCY = "IDR";

const safeCode = (code) => (CURRENCIES[code] ? code : DEFAULT_CURRENCY);

export const formatMoney = (amount, code, currencyDisplay = "symbol") => {
  const c = safeCode(code);
  return new Intl.NumberFormat(CURRENCIES[c].locale, {
    style: "currency",
    currency: c,
    currencyDisplay,
    minimumFractionDigits: 0,
    maximumFractionDigits: CURRENCIES[c].decimals,
  }).format(Number(amount) || 0);
};

// Untuk sumbu chart: Rp 1,5 jt / ₺1.5K
export const formatCompactMoney = (amount, code) => {
  const c = safeCode(code);
  return new Intl.NumberFormat(CURRENCIES[c].locale, {
    style: "currency",
    currency: c,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount) || 0);
};