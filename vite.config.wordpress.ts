
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-wordpress',
    lib: {
      entry: path.resolve(__dirname, 'src/wordpress-entry.tsx'),
      name: 'HistoriasMemorableQR',
      fileName: 'index',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    cssCodeSplit: false,
    minify: 'terser'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env': {}
  }
});
