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
