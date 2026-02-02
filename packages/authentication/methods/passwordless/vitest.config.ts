import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./src/**/*.spec.ts', './tests/**/*.spec.ts'],
    globals: true,
    root: './',
  },

  plugins: [tsconfigPaths()],
});
