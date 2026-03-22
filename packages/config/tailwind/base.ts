import type { Config } from "tailwindcss";

export const baseConfig: Partial<Config> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0A0A0F",
          50: "#1A1A2E",
          100: "#16213E",
          200: "#0F3460",
        },
        accent: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#C7D2FE",
          200: "#A5B4FC",
          300: "#818CF8",
          400: "#6366F1",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        surface: {
          DEFAULT: "#111118",
          card: "#16161F",
          border: "#2A2A3A",
          hover: "#1E1E2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "cinema-gradient": "linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #0A0A0F 100%)",
        "accent-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(99, 102, 241, 0.3)",
        "card-dark": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
};
