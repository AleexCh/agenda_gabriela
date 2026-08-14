/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        planner: {
          bg: '#F5F3FF',       // Light lavender background
          card: '#ffffff',      // Pure white container cards
          accent: '#C084FC',    // Purple accent
          active: '#A78BFA',    // Active purple state
          light: '#EDE9FE',     // Light purple fill
          border: '#E8E2FF',    // Soft lavender border
          text: '#4A004A',      // Dark purple text
          muted: '#8A6F8A',     // Muted purple-gray text
          today: '#E91E63',     // Pink/rose for today's date (complementary)
        }
      },
      fontFamily: {
        script: ['"Alex Brush"', 'cursive'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}