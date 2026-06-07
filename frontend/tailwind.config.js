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
        app: '#1A1A1B',
        surface: {
          DEFAULT: '#242526',
          elevated: '#2B2D2F',
          muted: '#202123',
        },
        line: '#3A3D40',
        foreground: '#F2F4F5',
        muted: '#A8ADB2',
        subtle: '#747A80',
        brand: {
          DEFAULT: '#1D9E75',
          hover: '#168763',
          dark: '#0F6E56',
          darker: '#085041',
          muted: '#123D33',
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
        },
        status: {
          pending: '#D99A21',
          progress: '#2D8CFF',
          done: '#22A06B',
          closed: '#8A8F98',
          danger: '#E5484D',
        },
        category: {
          occurrence: '#D97706',
          alert: '#E5484D',
          event: '#3B82F6',
          news: '#22A06B',
          service: '#14B8A6',
        },
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
}
