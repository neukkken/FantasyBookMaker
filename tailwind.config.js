/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        'xs': '0.9375rem',
        'sm': '1.0625rem',
        'base': '1.1875rem',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Garamond', 'serif'],
        mono: ['"Source Code Pro"', '"Courier New"', 'monospace'],
        titulo: ['"Playfair Display"', 'Georgia', 'serif'],
        lectura: ['Merriweather', 'Georgia', 'serif']
      },
      colors: {
        gothic: {
          bg: '#1a1a1e',
          surface: '#26262c',
          gold: '#c9a84c',
          'gold-light': '#e0c060',
          parchment: '#f0e8d8',
          'parchment-dark': '#d0c8b8',
          blood: '#c41010',
          'blood-light': '#e82424'
        }
      },
      boxShadow: {
        gothic: '0 0 20px rgba(0,0,0,0.7), 0 0 4px rgba(201,168,76,0.15)',
        'gothic-lg': '0 0 40px rgba(0,0,0,0.9), 0 0 8px rgba(201,168,76,0.1)'
      },
      backgroundImage: {
        'gothic-texture': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.012'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
}
