import sql from 'eslint-plugin-sql';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    rules: {
      'sql/format': [2, {}, { language: 'postgresql' }],
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.sql'],
    plugins: { sql },
  },
];
