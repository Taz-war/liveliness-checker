import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'frontend', // Source of your React files
  build: {
    outDir: '../static/dist', // Output to Flask's static folder
    emptyOutDir: true, // Clean the folder before building
    rollupOptions: {
      input: '/main.jsx', // Entry point
      output: {
        // Force consistent naming so you don't have to change Jinja templates constantly
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});