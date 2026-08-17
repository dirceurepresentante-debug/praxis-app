/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9f4',
          100: '#dcf0e6',
          200: '#bbe1d0',
          300: '#8ecbb3',
          400: '#5dae92',
          500: '#3a9175',
          600: '#2b745d',
          700: '#245d4c',
          800: '#1f4a3d',
          900: '#1b3d33',
        }
      }
    },
  },
  plugins: [],
}
