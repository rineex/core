# Auth Core — Contributor Onboarding

Welcome. Start here before diving into source.

## 1. Read the docs (in order)

1. [README.md](./README.md) — what is exported vs in-tree
2. [Architecture.md](./Architecture.md) — domain model as implemented
3. [Definition.md](./Definition.md) — ports, registries, contracts
4. [RULES.md](./RULES.md) — package topology
5. [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) — what is still missing

For aspirational designs (Flow DSL, Principal model), see
[FUTURE.md](./FUTURE.md).

## 2. Understand the public API

Check `src/index.ts` — only re-exported symbols are public. Much of the tree
(MFA, OAuth, session, token) is in-tree but unpublished.

## 3. Key patterns

- **Domain errors:** `AuthCoreErrorRegistry` + `DomainError<'NS.CODE'>`
- **Application outcomes:** `Result` from `@rineex/ddd` (v5+ — use `Result.err`,
  not `Result.fail`)
- **Auth methods:** implement `AuthMethodPort` (see OTP package)
- **Policy:** implement `AuthPolicyEvaluator`, register with `AuthPolicyEngine`

## 4. Run locally

```bash
cd packages/authentication/core
pnpm install   # from monorepo root
pnpm test
pnpm lint
pnpm check-types
```

## 5. Where to add code

| Change             | Location                                  |
| ------------------ | ----------------------------------------- |
| New auth method    | `packages/authentication/methods/<name>/` |
| Core domain rule   | `src/domain/`                             |
| New outbound port  | `src/ports/outbound/`                     |
| Flow orchestration | `src/application/services/`               |

## 6. Common pitfalls

- Do not assume Principal/Credential aggregates exist — use `Identity` entity
- Passwordless is not on `AuthMethodPort` yet
- Two types named `Identity` — check import path
- `ApplicationServicePort` returns `Promise<O>`, not `Result`

## 7. Next tasks

See [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md) for grab-able work items.
