import base from '@rynex/eslint-config/base.mjs';

export default [
  ...base,
  {
    rules: {
      'check-file/no-index': 'off',
    },
  },
];
