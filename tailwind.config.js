/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: [
    "./src/**/*.{html,ts}",
    './src/app/shared/ui/**/*.{html,ts}',
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwindcss-animate'),
  ]
};
