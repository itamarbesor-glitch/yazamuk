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
        neon: {
          cyan: "#00ffff",
          pink: "#ff00ff",
          green: "#00ff00",
          purple: "#9d4edd",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
