import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
        },
        violet: {
          50: "#F5F1FF",
          100: "#EDE5FF",
          200: "rgb(var(--accent-200) / <alpha-value>)",
          300: "rgb(var(--accent-text) / <alpha-value>)",
          400: "rgb(var(--accent-400) / <alpha-value>)",
          500: "rgb(var(--accent-500) / <alpha-value>)",
          600: "rgb(var(--accent-600) / <alpha-value>)",
          700: "rgb(var(--accent-700) / <alpha-value>)",
          800: "rgb(var(--accent-800) / <alpha-value>)",
          900: "rgb(var(--accent-900) / <alpha-value>)",
        },
        mist: {
          100: "rgb(var(--mist-100) / <alpha-value>)",
          300: "rgb(var(--mist-300) / <alpha-value>)",
          500: "rgb(var(--mist-500) / <alpha-value>)",
          700: "rgb(var(--mist-700) / <alpha-value>)",
        },
        line: "var(--line-color)",
        good: "#3DDC9A",
        bad: "#FF6B7A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        aurora:
          "radial-gradient(60% 50% at 15% 10%, rgb(var(--accent-500) / 0.25) 0%, rgb(var(--accent-500) / 0) 60%), radial-gradient(50% 40% at 85% 0%, rgb(var(--accent-400) / 0.18) 0%, rgb(var(--accent-400) / 0) 60%), radial-gradient(40% 40% at 50% 100%, rgb(var(--accent-600) / 0.15) 0%, rgb(var(--accent-600) / 0) 60%)",
        "grid-fade":
          "linear-gradient(to bottom, rgba(5,3,8,0) 0%, #050308 90%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--accent-400) / 0.15), 0 8px 40px -12px rgb(var(--accent-500) / 0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
