import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./src/**/*.(spec|test).ts'],
    globals: true,
    root: './',
  },

  plugins: [tsconfigPaths()],
});
