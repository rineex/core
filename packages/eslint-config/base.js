import { defineConfig } from '@fullstacksjs/eslint-config';
import turboPlugin from 'eslint-plugin-turbo';

export default defineConfig(
  {
    node: true,
    import: true,
    strict: true,
    test: true,
    typescript: true,
  },
  {
    ignores: ['dist/**'],
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
);
