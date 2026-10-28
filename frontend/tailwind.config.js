/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			// Poppins only: every font style (sans, serif, mono) uses Poppins
			fontFamily: {
				sans: ["Poppins", "sans-serif"],
				serif: ["Poppins", "sans-serif"],
				mono: ["Poppins", "sans-serif"],
			},
			// Editorial minimal: lighter weights, sharp corners, flat surfaces
			fontWeight: {
				bold: "600",
				extrabold: "600",
				black: "700",
			},
			letterSpacing: {
				tight: "-0.01em",
				tighter: "-0.02em",
			},
			borderRadius: {
				sm: "1px",
				DEFAULT: "2px",
				md: "2px",
				lg: "2px",
				xl: "3px",
				"2xl": "4px",
				"3xl": "4px",
			},
			boxShadow: {
				sm: "0 0 #0000",
				DEFAULT: "0 0 #0000",
				md: "0 6px 20px -10px rgba(62, 44, 35, 0.25)",
				lg: "0 12px 28px -14px rgba(62, 44, 35, 0.3)",
				xl: "0 16px 40px -16px rgba(62, 44, 35, 0.35)",
			},
			colors: {
				// Wardrobe theme: mauve brand color (buttons, links, highlights)
				brand: {
					50: "#FAF5F7",
					100: "#F4E9EE",
					200: "#E9D3DD",
					300: "#D8B4C4",
					400: "#BF8EA4",
					500: "#A67389",
					600: "#8E5E72",
					700: "#774C5E",
					800: "#634150",
					900: "#533844",
					950: "#2F1E26",
				},
				// Warm neutrals replace the default cool grays site-wide:
				// 50 = warm white background, 200-300 = light brown borders, 900 = dark brown text
				gray: {
					50: "#FAF6F1",
					100: "#F3ECE4",
					200: "#E8DCCF",
					300: "#D6C4B2",
					400: "#B39C87",
					500: "#8A7262",
					600: "#6B5446",
					700: "#574337",
					800: "#46352B",
					900: "#3E2C23",
					950: "#261A14",
				},
			},
		},
	},
	plugins: [],
};
