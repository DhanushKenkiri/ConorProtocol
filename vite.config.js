import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react({
      include: ['**/*.jsx', '**/*.js'],
    }),
    nodePolyfills({
      // To exclude specific polyfills, add them to this array:
      exclude: [],
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
      // Use direct buffer implementation to avoid externalization
      buffer: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['utf-8-validate', 'bufferutil']
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // Add esbuild options to prevent issues with big integers and WebAssembly
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      }
    }
  }
});
