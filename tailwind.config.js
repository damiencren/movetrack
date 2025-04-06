/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#f0f4f8',
        foreground: '#212121',
        card: '#f5f6fa',
        primary: '#1a434e',
        secondary: '#d2c2f8',
        accent: '#c3f44d',
      },
    },
  },
  plugins: [],
}