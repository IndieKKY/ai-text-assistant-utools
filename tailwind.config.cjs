/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],

  daisyui: {
    styled: true,
    themes: [{
      light: {
        ...require("daisyui/src/colors/themes")["[data-theme=light]"],
      },
    }, {
      dark: {
        ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
        "base-100": "#303133",
      }
    }],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
}
