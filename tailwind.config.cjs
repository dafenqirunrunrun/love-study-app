/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'gradient-shift-reverse': 'gradient-shift-reverse 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float-delay 6s ease-in-out 3s infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-shift-reverse': {
          '0%, 100%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delay': {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%': { transform: 'translate(30%, -30%) scale(1.05)' },
          '66%': { transform: 'translate(-20%, 20%) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}