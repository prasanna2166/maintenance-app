// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // adjust as needed
  theme: {
    extend: {
      colors: {
        gradientStart: '#3b82f6',   // blue-500
        gradientMiddle: '#14b8a6',  // teal-500
        gradientEnd: '#22c55e',     // green-500
        gradientSoft: '#e0f7f7',    // new soft color for headers
      },
    },
  },
  plugins: [],
}
