// Prices in the database are stored in INR. These are fixed demo rates (1 INR = x).
// KEEP IN SYNC with CURRENCIES in frontend/src/stores/useCurrencyStore.js
export const BASE_CURRENCY = "INR";

export const CURRENCY_RATES = {
	INR: 1,
	USD: 0.012,
	EUR: 0.011,
	GBP: 0.0095,
	AED: 0.044,
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_RATES);

export const isSupportedCurrency = (code) => SUPPORTED_CURRENCIES.includes(code);

// INR amount -> smallest unit of the target currency (paise / cents / fils)
export const toMinorUnits = (inrAmount, currency) =>
	Math.round(inrAmount * CURRENCY_RATES[currency] * 100);

// spend this much (in INR, before conversion) to earn the 10% reward coupon
export const REWARD_THRESHOLD_INR = 2000;