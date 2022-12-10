import { build, defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts(), react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'react-sketchboard',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'react',
        },
      },
    },
  },
});
