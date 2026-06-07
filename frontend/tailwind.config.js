/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D9E75',
          dark: '#0F6E56',
          darker: '#085041',
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
        },
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
}
