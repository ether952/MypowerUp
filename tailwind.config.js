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
          950: '#FAFAFA', // Canvas base claro
          900: '#FFFFFF', // Tarjetas y superficies blancas
          850: '#F4F4F5', // Contenedores secundarios y pills (zinc-100)
          800: '#E4E4E7', // Bordes sutiles y hovers (zinc-200)
          700: '#D4D4D8', // Bordes más marcados (zinc-300)
          600: '#71717A', // Textos secundarios (zinc-500)
        },
        neon: {
          purple: '#18181B', // Zinc 900 elegante
          violet: '#27272A', // Zinc 800
          fuchsia: '#09090B', // Negro profundo
          cyan: '#3F3F46',   // Zinc 700
          mint: '#10B981',   // Acento sutil verde esmeralda / minimalista
          blue: '#18181B',
          yellow: '#000000',
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
