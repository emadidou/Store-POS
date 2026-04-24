/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f3f8f0',
          100: '#deecd8',
          200: '#c1ddb6',
          300: '#96c686',
          400: '#69a95b',
          500: '#478b3e',
          600: '#356f31',
          700: '#2d592b',
          800: '#274826',
          900: '#1f3b21',
        },
        grove: '#1f4d36',
        cream: '#fbf8ef',
        linen: '#f5efe1',
        citrus: '#f5a524',
        tomato: '#d94b2b',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(31, 77, 54, 0.12)',
        lift: '0 18px 44px rgba(31, 77, 54, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
