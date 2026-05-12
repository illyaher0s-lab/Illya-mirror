/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kenya-cream': '#E8E3DC',
        'kenya-brown': '#B5A79A',
        'kenya-dark': '#2B2B2B',
        'kenya-line': '#8B7D6F',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
