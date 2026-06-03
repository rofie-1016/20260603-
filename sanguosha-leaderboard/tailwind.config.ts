import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sgs: {
          bg: "#1a1410",
          card: "#2a2218",
          border: "#5c4a32",
          gold: "#c9a227",
          "gold-light": "#e8c547",
          red: "#8b1a1a",
          "red-light": "#b52a2a",
          parchment: "#f4e8d0",
          muted: "#9a8b72",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
