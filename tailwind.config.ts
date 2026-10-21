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
          50: "#f5f7fb",
          100: "#e9edf6",
          200: "#cfd8e9",
          300: "#a6b5d1",
          400: "#748cb4",
          500: "#526c99",
          600: "#3d557e",
          700: "#324467",
          800: "#2b3a56",
          900: "#1c2740",
          950: "#111a2e",
        },
        gold: {
          50: "#fdf9ed",
          100: "#f8edcb",
          200: "#f0d894",
          300: "#e7bf5c",
          400: "#dfa734",
          500: "#c98a1c",
          600: "#a96a15",
          700: "#874d14",
          800: "#713e18",
          900: "#603418",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 26, 46, 0.06), 0 8px 24px -12px rgba(17, 26, 46, 0.25)",
        lift: "0 18px 40px -24px rgba(17, 26, 46, 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-in": "slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
