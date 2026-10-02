# pg-slonik example

A private NestJS application demonstrating `@rineex/pg-slonik` registration with
a local PostgreSQL DSN and a Slonik field-name transformation interceptor.

```bash
pnpm install
pnpm --dir packages/pg-slonik/example start:dev
```

The example source uses `postgresql://rineex:rineex@localhost:5432/rineex`; make
that database available or replace the DSN in `src/app.module.ts` before
starting it.
