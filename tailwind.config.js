/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        sovereign: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a2e",
          600: "#16213e",
          500: "#0f3460",
          400: "#533483",
          300: "#e94560",
          200: "#00d4aa",
          100: "#00ff88",
        },
      },
    },
  },
  plugins: [],
};
