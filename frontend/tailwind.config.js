/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefaf7',
          100: '#d4f1ea',
          200: '#a9e3d6',
          300: '#74cec0',
          400: '#41b3a4',
          500: '#22988a',
          600: '#177a70',
          700: '#15625b',
          800: '#144e49',
          900: '#12413e',
        },
        accent: {
          500: '#2f6fed',
          600: '#2559c4',
        },
        danger: {
          500: '#e02424',
          600: '#c81e1e',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
