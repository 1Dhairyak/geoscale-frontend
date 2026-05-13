/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        geo: {
          purple: "#7c3aed",
          "purple-light": "#ede9fe",
          "purple-hover": "#6d28d9",
          "purple-dim": "#a78bfa",
          border: "#e8eaed",
          surface: "#f9fafb",
          text: "#1a1a2e",
          muted: "#6b7280",
          subtle: "#9ca3af",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
