/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"]
      },
      colors: {
        navy: {
          800: "#111d38",
          850: "#0d182e",
          900: "#091024",
          950: "#040814"
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        brand: {
          red: "#ef4444",
          amber: "#f59e0b",
          emerald: "#10b981",
          slate: "#0f172a"
        }
      }
    }
  },
  plugins: []
};
