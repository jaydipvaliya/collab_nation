/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090A',
        surface: '#111214',
        surface2: '#18191D',
        accent: '#00E5A0',
        accent2: '#0066FF',
        accent3: '#FF6B35',
        ink: '#F0EEE9',
        muted: '#6B6D75',
        muted2: '#9A9CA5',
        tag: '#1E2026',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
