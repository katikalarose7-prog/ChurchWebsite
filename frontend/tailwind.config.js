/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#15223A',
          50: '#EEF1F6',
          100: '#D2D9E6',
          200: '#A7B4CC',
          300: '#7387AC',
          400: '#405678',
          500: '#15223A',
          600: '#101A2C',
          700: '#0C1420',
          800: '#080D15',
          900: '#04060A',
        },
        candle: {
          DEFAULT: '#C89A3D',
          50: '#FBF5E9',
          100: '#F3E3BE',
          200: '#E6C77E',
          300: '#D7AC55',
          400: '#C89A3D',
          500: '#A97D26',
          600: '#87621D',
          700: '#5F4514',
        },
        parchment: {
          DEFAULT: '#FAF9F6',
          100: '#FFFFFF',
          200: '#EFEDE6',
        },
        sage: {
          DEFAULT: '#4A6670',
          100: '#E6ECED',
          400: '#4A6670',
          600: '#33474E',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        app: '1.75rem',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(21,34,58,0.25)',
        nav: '0 -4px 24px -8px rgba(21,34,58,0.15)',
      },
      backgroundImage: {
        'candle-glow':
          'radial-gradient(80% 60% at 50% 0%, rgba(200,154,61,0.22) 0%, rgba(200,154,61,0) 70%)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
