/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        base: {
          950: "#07090f",
          900: "#0a0d14",
          850: "#0d1017",
          800: "#111623",
          750: "#141a28",
          700: "#1a2035",
          600: "#1e2a40",
          500: "#243048",
        },
        accent: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
        muted:   "#475569",
        subtle:  "#334155",
        border:  "#1e2d40",
        "border-light": "#2d3f58",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        "gradient-card":  "linear-gradient(145deg, #111623 0%, #0d1017 100%)",
      },
      boxShadow: {
        card:   "0 4px 24px rgba(0,0,0,0.4)",
        glow:   "0 0 20px rgba(59,130,246,0.15)",
        "glow-sm": "0 0 10px rgba(59,130,246,0.1)",
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease forwards",
        "slide-up":    "slideUp 0.4s ease forwards",
        "slide-right": "slideRight 0.3s ease forwards",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "spin-slow":   "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 },              to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideRight: { from: { opacity: 0, transform: "translateX(-16px)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};
