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
          50: "#f5f0ff",
          100: "#ede0ff",
          200: "#dbc5ff",
          300: "#c39aff",
          400: "#a865ff",
          500: "#8b3dff",
          600: "#7c1fff",
          700: "#6b0fe0",
          800: "#5a0fb8",
          900: "#4a1094",
          950: "#2e0664",
        },
        obsidian: {
          50: "#f6f6f7",
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
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
