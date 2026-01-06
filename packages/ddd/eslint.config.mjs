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
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'Use static factory methods instead of new.',
          selector: 'NewExpression[callee.name=/^[A-Z].*/]',
        },
      ],
    },
    files: ['*.entity.ts', '*.vo.ts'],
  },
  {
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules (e.g., 'fs', 'path')
            'external', // External dependencies (e.g., 'react', 'lodash')
            'nestjs',
            'common', // Your custom group for '@/common/*'
            'internal', // Other internal imports (e.g., '~/components/Button')
            'parent', // Parent directory imports (e.g., '../utils')
            'sibling', // Same directory imports (e.g., './config')
            'index', // Index file imports (e.g., './')
          ],
          customGroups: {
            value: {
              nestjs: '@nestjs/*',
              common: '@/*', // Matches imports like '@/common/utils', '@/common/helpers', etc.
            },
          },

          newlinesBetween: 'always',
          type: 'line-length',

          order: 'desc',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],

      'perfectionist/sort-decorators': [
        'error',
        { type: 'line-length', order: 'desc' },
      ],
    },
  },
];
