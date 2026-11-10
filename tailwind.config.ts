import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 50: "#eef2ff", 100: "#e0e7ff", 600: "#3730a3", 700: "#312e81", 800: "#27256b", 900: "#1e1b4b" },
        sky: { 100: "#e0f2fe", 500: "#0ea5e9", 600: "#0284c7" },
        accent: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
      },
    },
  },
  plugins: [],
};
export default config;
