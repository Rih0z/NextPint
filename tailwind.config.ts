import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef8e7',
          100: '#fcecc4',
          200: '#f8d897',
          300: '#f3bf60',
          400: '#eda332',
          500: '#d4941e',
          600: '#b87914',
          700: '#945c13',
          800: '#7a4916',
          900: '#683d16',
          950: '#3c1f08',
        },
        secondary: {
          50: '#faf6f0',
          100: '#f3e8d7',
          200: '#e6cfad',
          300: '#d6b07c',
          400: '#cd853f',
          500: '#c26f2a',
          600: '#a55722',
          700: '#88441f',
          800: '#6f3820',
          900: '#5a2f1c',
          950: '#31170e',
        },
        background: {
          primary: '#0d0d0d',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e5e5',
          tertiary: '#a1a1a1',
        }
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
export default config