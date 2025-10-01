/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit', // Enable Just-In-Time mode for real-time class generation
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Ensure this is correct
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
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
