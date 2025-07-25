import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about missing assets
        if (warning.code === 'MISSING_EXPORT' || 
            warning.code === 'EMPTY_BUNDLE' || 
            warning.code === 'FILE_NOT_FOUND') {
          return;
        }
        warn(warning);
      }
    }
  }
})
