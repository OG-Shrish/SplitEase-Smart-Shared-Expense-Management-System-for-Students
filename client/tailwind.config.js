/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        background: "#F8FAFC",
        cards: "#FFFFFF",
        text: "#1F2937",
        success: "#10B981",
        danger: "#EF4444",
      }
    },
  },
  plugins: [],
}
