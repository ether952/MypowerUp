/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#121214', // Canvas base oscuro principal
          900: '#18181B', // Tarjetas y superficies elevadas
          850: '#222226', // Contenedores secundarios y pills
          800: '#2E2E34', // Bordes sutiles y hovers
          700: '#3E3E48', // Bordes marcados
          600: '#8A8F98', // Color de fuente solicitado
          500: '#B4B8C0', // Subtítulos y labels
          400: '#FFFFFF', // Títulos primarios blancos
        },
        neon: {
          purple: '#18181B',
          violet: '#27272A',
          fuchsia: '#121214',
          cyan: '#2E2E34',
          mint: '#22C55E',   // Verde enérgico para el UP
          green: '#4ADE80',
          blue: '#18181B',
          yellow: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
