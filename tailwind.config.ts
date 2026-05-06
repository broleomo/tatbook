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
          100: "#ffdede",
          200: "#ffb4b4",
          300: "#ff7a7a",
          400: "#f53030",
          500: "#c41010",
          600: "#780606",
          700: "#5c0505",
          800: "#450404",
          900: "#2e0303",
          950: "#170101",
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
