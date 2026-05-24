import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    include: ['src/**/*.spec.ts'],
    globals: true,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
