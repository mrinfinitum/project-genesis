import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        genesis: {
          void: "#050914",
          panel: "#0a1020",
          panel2: "#101827",
          line: "#1e3347",
          cyan: "#38d5ff",
          blue: "#4d8dff",
          green: "#5ef2a1",
          amber: "#ffd166",
          red: "#ff6b6b"
        }
      },
      boxShadow: {
        glow: "0 0 36px rgba(56, 213, 255, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
