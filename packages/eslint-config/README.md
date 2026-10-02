# @rineex/eslint-config

Private shared ESLint flat configurations for the Rineex Core workspace.

The package exposes four configuration entry points:

- `@rineex/eslint-config/base`
- `@rineex/eslint-config/next-js`
- `@rineex/eslint-config/react-internal`
- `@rineex/eslint-config/db`

Use an entry point from a package-level `eslint.config.mjs` and spread its
exported configuration into the local flat-config array. This package is
workspace tooling, not a runtime dependency for applications.
