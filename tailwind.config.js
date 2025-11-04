/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#dee2e6",
        input: "#dee2e6",
        ring: "#0077B6",
        background: "#F8F9FA",
        foreground: "#212529",
        primary: {
          DEFAULT: "#0077B6",
          foreground: "#ffffff",
          50: "#e6f2f7",
          100: "#b3d9e6",
          500: "#0077B6",
          600: "#005a8a",
          700: "#004d73",
          800: "#003d5c",
        },
        secondary: {
          DEFAULT: "#00BFA6",
          foreground: "#ffffff",
          50: "#e0f7f4",
          100: "#b3ede6",
          500: "#00BFA6",
          600: "#009980",
          700: "#007d66",
        },
        accent: {
          DEFAULT: "#FF6B6B",
          foreground: "#ffffff",
          50: "#ffe6e6",
          100: "#ffb3b3",
          500: "#FF6B6B",
          600: "#ff5252",
          700: "#ff3838",
        },
        destructive: {
          DEFAULT: "#FF6B6B",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#6C757D",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#212529",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#212529",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

