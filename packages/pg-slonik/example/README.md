# @rineex/pg-slonik example

Minimal NestJS app that uses `@rineex/pg-slonik` with
[slonik-interceptor-field-name-transformation](https://www.npmjs.com/package/slonik-interceptor-field-name-transformation)
to inject a Slonik pool and run queries. This folder is **not** part of the pnpm
workspace; it is for developers to see how to use the package.

## Setup

1. Build the package from the monorepo root:

   ```bash
   pnpm --filter @rineex/pg-slonik build
   ```

2. Install and run from this directory (use `--ignore-workspace` so this
   folder’s dependencies are installed):

   ```bash
   cd packages/pg-slonik/example
   pnpm install --ignore-workspace
   pnpm build
   pnpm start
   ```

Optional: set `DATABASE_URL` (default:
`postgresql://rineex:rineex@localhost:5432/rineex`).

## Endpoints

- **GET /** – Welcome message
- **GET /health** – Runs `SELECT current_timestamp` via Slonik and returns
  `{ ok, now }`
- **GET /fields** – Creates a table with snake_case columns, inserts a row, and
  returns rows so you can verify the interceptor returns camelCase keys
  (`fullName`, `createdAt`)

## Usage in code

- `SlonikModule.register({ connections: [{ name: 'DEFAULT', dsn, options: { interceptors } }] })`
  in `app.module.ts`
- Add `createFieldNameTransformationInterceptor({ format: 'CAMEL_CASE' })` from
  `slonik-interceptor-field-name-transformation` to transform result field names
  to camelCase
- `@InjectPool()` in services to inject the default pool
- Use `sql` from `slonik` (e.g. `sql.unsafe` for literal SQL) and
  `this.pool.one()`, `this.pool.any()`, etc.
