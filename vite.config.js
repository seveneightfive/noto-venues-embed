import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/embed-standalone.jsx',
      name: 'NOTOVenuesEmbed',
      fileName: 'noto-venues-embed',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
