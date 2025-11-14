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
      entry: 'src/embed.jsx',
      name: 'NOTOVenues',
      fileName: 'noto-venues-embed',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {}
      }
    }
  }
});
