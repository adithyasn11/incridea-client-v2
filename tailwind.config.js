/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        liquid: 'liquid 1s ease-in-out infinite',
      },
      keyframes: {
        liquid: {
          '0%, 100%': { transform: 'translateX(-50%)' },
          '50%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [],
}

