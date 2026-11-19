/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
        patrick: ['"Patrick Hand"', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        sakura: {
          50: '#fff5f7',
          100: '#ffe4e9',
          200: '#fecdd7',
          300: '#fda4b8',
          400: '#fb7193',
          500: '#f43f6e',
          600: '#e11d57',
        },
        matcha: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ccd9cc',
          300: '#a6bea6',
          400: '#7f9f7f',
          500: '#5c7c5c',
        },
        cocoa: {
          50: '#fbf9f6',
          100: '#f5efe6',
          200: '#ebdece',
          300: '#dbc4aa',
          400: '#c5a381',
          500: '#8c6b4a',
        },
        lavender: {
          50: '#f8f7fc',
          100: '#f0eef8',
          200: '#e0dcf0',
          300: '#c6bfe4',
          400: '#a79cd4',
          500: '#8374be',
        }
      },
      boxShadow: {
        'book': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 15px rgba(0, 0, 0, 0.05)',
        'polaroid': '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
