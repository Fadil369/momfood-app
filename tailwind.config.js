/** @type {import('tailwindcss').Config} */
module.exports = {
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
      padding: "1.25rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // لُقمة يُمّه — brand palette
        olive: {
          DEFAULT: '#5a6b3a',
          dark: '#3a4a2a',
          light: '#7d8c5a',
        },
        gold: {
          DEFAULT: '#c9a961',
          dark: '#a88a47',
          light: '#e6cf94',
        },
        cream: {
          DEFAULT: '#faf6ee',
          warm: '#f4ead7',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Cairo"', 'Tajawal', 'serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.2)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(1)' },
        },
        caret: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        heartbeat: 'heartbeat 1.6s ease-in-out infinite',
        caret: 'caret 0.9s steps(2) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
