/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4D6D',
        'primary-dark': '#E63950',
        secondary: '#FFD93D',
        accent: '#00F5D4',
        'accent-dark': '#00C4A8',
      },
      backgroundImage: {
        'dopamine': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      },
    },
  },
  plugins: [],
}
