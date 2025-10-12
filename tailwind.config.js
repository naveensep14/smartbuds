/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Success Buds Brand Colors
        navy: '#283B4B',        // Navy Blue Cap - Primary brand color
        yellow: '#E9B921',      // Yellow Tussel - Accent/highlight
        green: '#B6C854',       // Green Leaf - Success/positive actions
        peach: '#FFBCAB',       // Face Peach - Warm accent
        blue: '#5C9DB8',        // Blue in Book - Secondary actions
        pink: '#F18D77',        // Pink in Book - Attention/warning
        cream: '#FAEBD6',       // Book Cream - Background/neutral
        
        // Semantic color mappings for better UX
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#283B4B',       // Navy as primary
          600: '#1e2a35',
          700: '#1a2329',
          800: '#151c21',
          900: '#0f1418',
        },
        secondary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd9a7',
          300: '#f8c17b',
          400: '#f5a94f',
          500: '#E9B921',       // Yellow as secondary
          600: '#d4a61e',
          700: '#bf931a',
          800: '#aa8017',
          900: '#956d14',
        },
        success: {
          50: '#f7f8f0',
          100: '#eff1e1',
          200: '#dfe3c3',
          300: '#cfd5a5',
          400: '#bfc787',
          500: '#B6C854',       // Green as success
          600: '#a4b34c',
          700: '#929e44',
          800: '#80893c',
          900: '#6e7434',
        },
        warning: {
          50: '#fef2f0',
          100: '#fde5e1',
          200: '#fbcbc3',
          300: '#f9b1a5',
          400: '#f79787',
          500: '#F18D77',       // Pink as warning
          600: '#d97f6b',
          700: '#c1715f',
          800: '#a96353',
          900: '#915547',
        },
        accent: {
          50: '#f0f7fa',
          100: '#e1eff5',
          200: '#c3dfeb',
          300: '#a5cfe1',
          400: '#87bfd7',
          500: '#5C9DB8',       // Blue as accent
          600: '#538da6',
          700: '#4a7d94',
          800: '#416d82',
          900: '#385d70',
        },
        neutral: {
          50: '#FAEBD6',        // Cream as neutral background
          100: '#f5e0c7',
          200: '#ebc18f',
          300: '#e1a257',
          400: '#d7831f',
          500: '#cd6400',
          600: '#b75700',
          700: '#a14a00',
          800: '#8b3d00',
          900: '#753000',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
} 