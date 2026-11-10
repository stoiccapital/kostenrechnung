/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d6dae0",
          300: "#b3bac5",
          400: "#8892a2",
          500: "#636e81",
          600: "#4e5768",
          700: "#3f4655",
          800: "#2f343f",
          900: "#1b1e26",
          950: "#0f1116",
        },
      },
    },
  },
  plugins: [],
};
