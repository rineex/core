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

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'n/no-unpublished-import': 'off',
      'prefer-exponentiation-operator': 'error',
    },
  },
);
