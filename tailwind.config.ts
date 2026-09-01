import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf4",
          100: "#d6f9e2",
          400: "#22c07a",
          500: "#0fa968",
          600: "#0a8a54",
          700: "#0a6f45",
          900: "#0a3d29",
        },
      },
    },
  },
  plugins: [],
};

export default config;
