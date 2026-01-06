import config from '@rineex/eslint-config/base';
import db from '@rineex/eslint-config/db';

/* import type { Linter } from 'eslint'; */
export default [
  ...config,
  ...db,

  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['off'],
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
