/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#007C92',
          'primary-dark': '#00697A',
          'primary-light': '#4DB6C1',
          accent: '#F47920',
          'accent-dark': '#D66714',
          'accent-light': '#FF9A4D',
        },
        neutral: {
          50: '#F5F7FA',
          100: '#E4E8EE',
          200: '#CBD2DC',
          300: '#9AA5B1',
          400: '#7B8794',
          500: '#616E7C',
          600: '#52606D',
          700: '#3E4C59',
          800: '#323F4B',
          900: '#364152',
        }
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
