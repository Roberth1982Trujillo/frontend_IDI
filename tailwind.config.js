/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unt: {
          dark: '#002244',
          blue: '#003B70',
          hover: '#004d94',
          light: '#EBF3FC',
          surface: '#F8FAFC',
          gold: '#C59B27',
          goldLight: '#FEF9C3',
          teal: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 39, 77, 0.08), 0 2px 6px -1px rgba(0, 39, 77, 0.04)',
        'elevated': '0 10px 30px -4px rgba(0, 39, 77, 0.12), 0 4px 10px -2px rgba(0, 39, 77, 0.06)',
      }
    },
  },
  plugins: [],
}
