/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./g-mart/src/**/*.{js,jsx,ts,tsx}",  // ✅ Watch your JSX/TSX files
    "./g-mart/public/**/*.{html,js}",     // optional
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
