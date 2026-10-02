# Development workflow

This repository is a pnpm workspace orchestrated by Turborepo. The root
`package.json` pins pnpm 10.22.0 and sets Node 24.12.0 through Volta. Use that
toolchain for development; `@rineex/pg-slonik` itself supports Node 18 or later.

## First checkout

```bash
corepack enable
pnpm install
pnpm build
pnpm test
```

`pnpm build` runs every package build in dependency order. `pnpm test` first
builds required packages, then runs each package test task. A clean test run can
emit expected test-double logs from Redis and Slonik tests; the command result
is authoritative.

## Workspace commands

| Command               | What it runs                                 |
| --------------------- | -------------------------------------------- |
| `pnpm build`          | `turbo run build` for all workspace packages |
| `pnpm test`           | `turbo run test`, after required builds      |
| `pnpm test:types`     | declared `tsd` type tests                    |
| `pnpm check-types`    | TypeScript no-emit checks                    |
| `pnpm lint`           | package lint tasks                           |
| `pnpm lint:fix`       | package lint fixes where implemented         |
| `pnpm prettier`       | checks formatting without writing            |
| `pnpm prettier:write` | writes formatting changes                    |

Run an individual package task with a package filter:

```bash
pnpm --filter @rineex/ddd test
pnpm --filter @rineex/decision-engine check-types
pnpm --filter @rineex/pg-slonik build
```

## Test and build layout

Most libraries use tsup for CJS, ESM, and declaration output, plus Vitest for
tests. The cookie-parser, CORS, favicon-ignore, and response-time middleware
modules declare Jest test commands. Tests may live next to implementation code
(`*.spec.ts`) or in a package-level `tests` directory.

Do not commit generated `dist` output unless a package explicitly tracks it. The
root pre-commit hook formats and spell-checks staged Markdown, JSON, YAML, HTML,
TypeScript, and TSX files. The pre-push hook runs `pnpm test`.

## Add or change a package

The package generator creates a standard library skeleton:

```bash
pnpm g:pkg my-package "Short package description"
```

The name accepts only lowercase letters, numbers, and hyphens. The generator
creates package metadata, TypeScript and tsup configs, Vitest config, ESLint
config, and an empty `src/index.ts`. It does not decide the public API: add
deliberate exports to `src/index.ts`, write tests, and document the package
README before publishing.

## Publishing

This repository uses Changesets.

```bash
pnpm changeset
pnpm changeset:version
pnpm build
pnpm changeset:publish
```

Create a changeset for every consumer-visible package change.
`changeset:version` also formats the repository. Published packages expose
artifacts from `dist`; validate the package entry point rather than relying on
internal source paths.
