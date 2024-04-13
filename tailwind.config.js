/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'ping-short': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) 1 forwards',
        'card-drawn': 'card-drawn 0.2s cubic-bezier(0, 0, 0.2, 1) 1 backwards',
      },

      keyframes: {
        'card-drawn': {
          'from': { transform: 'translateX(85rem)' },
        },
      }
    },
  },
  plugins: [],
}
