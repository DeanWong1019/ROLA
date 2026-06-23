import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: '.',
    rollupOptions: {
      input: 'src/home-webgl.js',
      output: {
        format: 'iife',
        name: 'HomeWebGL',
        entryFileNames: 'assets/home-webgl.bundle.js',
        chunkFileNames: 'assets/home-webgl.[hash].js',
        assetFileNames: 'assets/home-webgl.[name][extname]'
      }
    }
  }
});
