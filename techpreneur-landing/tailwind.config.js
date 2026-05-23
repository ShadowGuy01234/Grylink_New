/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Gryork brand colors
        "gry-blue-dark":  "#0A2463",
        "gry-blue-main":  "#1E5AAF",
        "gry-blue-light": "#3B82F6",
        "gry-green":      "#22C55E",
        "gry-green-dark": "#15803D",
        "gry-navy":       "#060C1A",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body:    ["Inter", "sans-serif"],
      },
      animation: {
        "float":       "float 5s ease-in-out infinite",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in-up":  "fadeInUp 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "hero-gradient":   "linear-gradient(135deg, #0A2463 0%, #1E5AAF 50%, #3B82F6 100%)",
        "blue-gradient":   "linear-gradient(135deg, #1E5AAF, #3B82F6)",
        "cta-gradient":    "linear-gradient(90deg, #1E5AAF, #22C55E)",
        "logo-gradient":   "linear-gradient(180deg, #3B82F6 0%, #0A2463 100%)",
      },
      boxShadow: {
        "blue-glow": "0 8px 24px rgba(30, 90, 175, 0.35)",
        "blue-lg":   "0 16px 40px rgba(30, 90, 175, 0.25)",
        "card":      "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover":"0 10px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
