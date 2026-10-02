# Development workflow

This workspace uses pnpm workspaces and Turborepo. Install dependencies with the
pnpm version declared by the root `package.json`.

## Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm test:types
pnpm check-types
pnpm lint
pnpm lint:fix
pnpm prettier:write
```

Turborepo runs package tasks with their declared dependency order. `test`
depends on builds; `test:types` runs only packages that define type tests.

Run a single package task with its package name:

```bash
pnpm --filter @rineex/decision-engine test
pnpm --filter @rineex/ddd check-types
pnpm --filter @rineex/pg-slonik build
```

## Build and test conventions

Most TypeScript packages use tsup and Vitest. The cookie-parser, CORS,
favicon-ignore, and response-time Nest modules use Jest; the Helmet module uses
Vitest. Source tests live alongside source files or in a package `tests`
directory.

## Release workflow

Changesets is configured at the workspace root. Create a release entry with
`pnpm changeset`, apply selected versions with `pnpm changeset:version`, then
publish with `pnpm changeset:publish`. Build before publishing.

## Create a package

The generator creates a new `packages/<name>` library skeleton, including
TypeScript, tsup, Vitest, ESLint, and package metadata.

```bash
pnpm g:pkg my-package "Short package description"
```

Names must use lowercase letters, numbers, and hyphens. The generator does not
add exports or business code; add public exports to the generated `src/index.ts`
before publishing.
