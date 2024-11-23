/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'custom-pink': '#FFB6C1', // Replace with your desired hex codes
        'custom-purple': '#D8BFD8',
      },
    },
  },
  plugins: [],
}

