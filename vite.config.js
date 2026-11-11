import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // relative asset paths so the build works on any static host / subpath
  plugins: [react()],
  resolve: {alias: {'@': '/src'}},
  // Pre-scan lazy routes too, so the dev optimizer never re-bundles mid-session (duplicate React).
  optimizeDeps: {entries: ['index.html', 'src/**/*.{js,jsx}']},
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          grid: ['@mui/x-data-grid'],
        },
      },
    },
  },
});
