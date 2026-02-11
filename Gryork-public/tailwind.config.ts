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
        // Primary Blue Palette
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#1E5AAF",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#0A2463",
        },
        // Accent Green Palette
        accent: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #0A2463 0%, #1E5AAF 50%, #3B82F6 100%)",
        "gradient-cta": "linear-gradient(90deg, #1E5AAF 0%, #22C55E 100%)",
        "gradient-accent": "linear-gradient(180deg, #86EFAC 0%, #15803D 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
