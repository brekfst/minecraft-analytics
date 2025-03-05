/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          blue: {
            50: '#E6F0FF',
            600: '#5865F2',
            700: '#4752C4',
          },
        },
        fontFamily: {
          sans: ['Roboto', 'Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '80': '20rem',
          '96': '24rem',
        },
        boxShadow: {
          'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }