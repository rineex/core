import { defineConfig } from 'tsup';

export default defineConfig(() => ({
  // eslint-disable-next-line n/no-process-env
  minify: process.env.CI === 'true',
  tsconfig: 'tsconfig.build.json',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
}));
