/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CivicShieldAI light theme — cool slate surface, deep-ink navy for
        // structure/headings, signal teal as the primary "AI is watching"
        // accent, plus a status scale used consistently for severity/risk.
        surface: {
          DEFAULT: "#F5F7FA",
          card: "#FFFFFF",
          sunken: "#EEF2F6",
        },
        ink: {
          DEFAULT: "#0B2545",
          soft: "#3A4A63",
          muted: "#6B7A90",
          faint: "#9AA7B8",
        },
        signal: {
          DEFAULT: "#0E7C86",
          light: "#12989F",
          dark: "#0A5F67",
          50: "#EAF6F7",
        },
        status: {
          low: "#2E9E5B",
          moderate: "#E0A526",
          high: "#E07A2C",
          critical: "#D6483F",
        },
        line: "#E2E8F0",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,37,69,0.04), 0 8px 24px -12px rgba(11,37,69,0.12)",
        pop: "0 12px 32px -8px rgba(11,37,69,0.20)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        sweep: "sweep 2.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
