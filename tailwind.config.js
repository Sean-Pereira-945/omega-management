/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0d0f1a',
          700: '#1e2233',
          500: '#3b4158',
        },
        dune: {
          50: '#f7f2ea',
          100: '#efe7da',
          200: '#e2d6c3',
          300: '#c9b99a',
        },
        sun: {
          500: '#ff7a45',
          600: '#ea5d2c',
        },
        mint: {
          500: '#3fcaa4',
          600: '#2fb191',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -40px rgba(13, 15, 26, 0.6)',
      },
    },
  },
  plugins: [],
}

