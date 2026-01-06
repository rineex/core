import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    include: ['./src/**/*.spec.ts'],
    globals: true,
    root: './',
  },

  plugins: [tsconfigPaths()],
});
