module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#3B82F6",  // Tailwind blue-500
      },
      fontFamily: {
        sans: ['"Inter"', "sans-serif"], // Or use 'Geist' if you prefer
      },
    },
  },
  plugins: [],
}
