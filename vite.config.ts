import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Слушать на всех интерфейсах
    open: true,
    strictPort: false, // Позволить использовать другой порт если 3000 занят
    fs: {
      allow: ['..', 'node_modules']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/types/*': resolve(__dirname, 'src/types/*'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/components/*': resolve(__dirname, 'src/components/*'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/utils/*': resolve(__dirname, 'src/utils/*'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/assets/*': resolve(__dirname, 'src/assets/*'),
      '@/store': resolve(__dirname, 'src/store'),
      '@/store/*': resolve(__dirname, 'src/store/*'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/hooks/*': resolve(__dirname, 'src/hooks/*'),
    },
  },
  optimizeDeps: {
    include: ['zustand'],
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          ui: ['zustand'],
        },
      },
    },
  },
});
