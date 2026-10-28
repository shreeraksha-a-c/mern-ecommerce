import { create } from "zustand";

export const CURRENCIES = {
	INR: { code: "INR", symbol: "₹", name: "INR (₹)", rate: 1 },
	USD: { code: "USD", symbol: "$", name: "USD ($)", rate: 0.012 },
	EUR: { code: "EUR", symbol: "€", name: "EUR (€)", rate: 0.011 },
	GBP: { code: "GBP", symbol: "£", name: "GBP (£)", rate: 0.0095 },
	AED: { code: "AED", symbol: "AED ", name: "AED", rate: 0.044 },
};

const getInitialCurrency = () => {
	const saved = localStorage.getItem("selected_currency");
	if (saved && CURRENCIES[saved]) return saved;
	return "INR"; // Default: Indian Rupee
};

export const useCurrencyStore = create((set, get) => ({
	currentCurrency: getInitialCurrency(),

	setCurrency: (code) => {
		if (CURRENCIES[code]) {
			localStorage.setItem("selected_currency", code);
			set({ currentCurrency: code });
		}
	},

	formatPrice: (amount) => {
		const num = Number(amount) || 0;
		const { currentCurrency } = get();
		const curr = CURRENCIES[currentCurrency] || CURRENCIES.INR;
		const converted = num * curr.rate;

		if (curr.code === "INR") {
			return `₹${Math.round(converted).toLocaleString("en-IN")}`;
		}
		return `${curr.symbol}${converted.toFixed(2)}`;
	},
}));
