import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ff9f9f",
          400: "#ff6464",
          500: "#ff2d2d",
          600: "#ed1515",
          700: "#c80d0d",
          800: "#a50f0f",
          900: "#881414",
          950: "#4b0404",
        },
        obsidian: {
          50:  "#f6f6f7",
          100: "#e1e3e7",
          200: "#c3c7cf",
          300: "#9da3ae",
          400: "#777e8c",
          500: "#5c6371",
          600: "#494e5b",
          700: "#3c4049",
          800: "#2a2d35",
          900: "#1a1c22",
          950: "#0d0e12",
        },
      },
      fontFamily: {
        display: ["var(--font-boldonse)", "cursive"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
