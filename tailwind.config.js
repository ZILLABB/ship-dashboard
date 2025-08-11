/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // ShipShift Brand Colors
        olive: {
          50: "#f7f8f0",
          100: "#eef0e1",
          200: "#dde1c3",
          300: "#ccd2a5",
          400: "#bbc387",
          500: "#8b9538",
          600: "#6b7a26",
          700: "#556020",
          800: "#3f451a",
          900: "#2a2f14",
        },
        claude: {
          50: "#fef7f0",
          100: "#fdeee0",
          200: "#fad5b8",
          300: "#f7bc90",
          400: "#f4a368",
          500: "#f18a40",
          600: "#d4722a",
          700: "#b85a14",
          800: "#9c4200",
          900: "#7a3300",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, var(--olive-600), var(--claude-500), var(--olive-700))",
        "text-gradient":
          "linear-gradient(135deg, var(--olive-600), var(--olive-500))",
        "premium-gradient":
          "linear-gradient(135deg, var(--olive-600), var(--claude-500), var(--olive-500))",
      },
      animation: {
        "gradient-shift": "gradientShift 15s ease infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseGlow: {
          from: { boxShadow: "0 0 20px rgba(107, 122, 38, 0.4)" },
          to: { boxShadow: "0 0 30px rgba(107, 122, 38, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(107, 122, 38, 0.1), 0 1px 2px 0 rgba(107, 122, 38, 0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(107, 122, 38, 0.1), 0 2px 4px -1px rgba(107, 122, 38, 0.06)",
        glow: "0 0 20px rgba(107, 122, 38, 0.4)",
        "glow-lg": "0 0 30px rgba(107, 122, 38, 0.8)",
      },
    },
  },
  plugins: [],
};
