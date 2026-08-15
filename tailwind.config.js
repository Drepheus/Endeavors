/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0a0a',
          900: '#111113',
          800: '#18181b',
          700: '#232326',
        },
      },
    },
  },
  plugins: [],
}
