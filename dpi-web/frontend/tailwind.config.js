/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          900: "#0B0F14",
          800: "#121923",
          700: "#1A2430",
        },
        accent: {
          500: "#22C3EE",
          600: "#1AA4CA",
        },
        text: {
          100: "#E8EEF5",
          300: "#A9B4C2",
        },
        card: "#141D29",
        border: "#233244",
      },
    },
  },
  plugins: [],
};