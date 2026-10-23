import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey =
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    env.GEMINI_KEY ||
    env.key ||
    env.KEY ||
    env.GOOGLE_API_KEY ||
    env.GOOGLE_GEMINI_API_KEY ||
    '';

  return {
    plugins: [react()],
    define: {
      __APP_GEMINI_KEY__: JSON.stringify(geminiKey)
    },
    envPrefix: ['VITE_', 'FIREBASE_', 'GEMINI_', 'GOOGLE_', 'KEY', 'key'],
    server: {
      port: 5173,
      host: true,
      open: false
    }
  };
});
