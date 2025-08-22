/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        barnz: {
          900: "#004D47",
          700: "#00784B",
          500: "#00B476",
          200: "#D3E9E6",
          100: "#E5F2F0",
        },
      },
    },
  },
  plugins: [],
};
