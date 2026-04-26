import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        blood: "var(--color-blood)",
        ok: "var(--color-green)",
        warn: "var(--color-amber)",
        ink: "var(--color-text)",
        muted: "var(--color-text-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Pirata One", "Impact", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        comic: "4px 4px 0 0 #0e0e10",
        "comic-primary": "4px 4px 0 0 var(--color-primary)",
        "comic-blood": "4px 4px 0 0 var(--color-blood)",
        "comic-sm": "2px 2px 0 0 #0e0e10",
      },
      keyframes: {
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "75%": { transform: "translateX(3px)" },
        },
        burst: {
          "0%": { transform: "scale(0.2) rotate(-10deg)", opacity: "0" },
          "50%": { transform: "scale(1.15) rotate(3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 120ms ease-in-out",
        burst: "burst 400ms cubic-bezier(.34,1.56,.64,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
