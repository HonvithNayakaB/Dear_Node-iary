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
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
        },
        book: {
          cover: 'var(--color-book-cover)',
          border: 'var(--color-book-border)',
          stitch: 'var(--color-book-stitch)',
          page: 'var(--theme-page-bg)',
          text: 'var(--theme-page-text)',
        },
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
