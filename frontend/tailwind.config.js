/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b1020",
          900: "#11172a",
          800: "#1a2238",
          700: "#243149",
          500: "#6b7693",
          300: "#aab1c5",
          100: "#e9ecf5",
        },
        accent: {
          500: "#6366f1",
          400: "#818cf8",
          600: "#4f46e5",
        },
        good: "#10b981",
        warn: "#f59e0b",
        bad:  "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
