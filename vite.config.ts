import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    // Removed css: { postcss: ... } to let Vite auto-detect postcss.config.js
    define: {
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY || env.VITE_API_KEY)
      }
    }
  };
});
