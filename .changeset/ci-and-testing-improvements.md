---
'@rineex/ddd': patch
---

### CI and Testing Improvements

- Added a new "Type Tests" job that runs `pnpm run test:types` in the CI
  workflow.
- Introduced a new script "test:types" and turbo task with inputs for
  `src/**/*.test-d.ts` for type testing.
