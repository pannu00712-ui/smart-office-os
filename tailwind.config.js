/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B3A6B', light: '#2451a3', dark: '#122850' },
        accent:  { DEFAULT: '#0072C6', light: '#3a9de8', dark: '#005aa0' },
      }
    }
  },
  plugins: []
}
