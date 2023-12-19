/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        "primary": "#1a1a1a",
        "secondary": "#282828",
        "tertiary": "#373737",
      }
    },
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
}

