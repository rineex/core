# @rineex/auth-core

Core authentication package for the Rineex framework. Built on `@rineex/ddd`
with a plugin model for auth methods.

## What Is Implemented

| Area                                           | Status                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| Authentication attempt aggregate + events      | Exported                                                  |
| Identity entity + value objects                | Exported                                                  |
| Policy engine (`AuthPolicyEngine`)             | Exported                                                  |
| `AuthMethodPort` + flow orchestration services | Port exported; services in-tree                           |
| OTP method adapter                             | `@rineex/authentication-method-otp`                       |
| Passwordless challenge domain                  | `@rineex/authentication-method-passwordless` (standalone) |
| MFA session domain + services                  | In-tree, not exported                                     |
| OAuth authorization domain                     | In-tree, not exported                                     |
| Session / token domains                        | In-tree, not exported                                     |

**Not implemented:** SSO, social login, credential lifecycle, Flow DSL, trust
levels.

## Installation

```bash
pnpm add @rineex/auth-core @rineex/ddd
```

## Documentation

| Document                                              | Description                                |
| ----------------------------------------------------- | ------------------------------------------ |
| [Architecture.md](./Architecture.md)                  | Domain model and layering (as implemented) |
| [Definition.md](./Definition.md)                      | Contracts, registries, ports               |
| [RULES.md](./RULES.md)                                | Package topology and port map              |
| [GAP_ANALYSIS.md](./GAP_ANALYSIS.md)                  | Remaining work                             |
| [ONBOARDING.md](./ONBOARDING.md)                      | Contributor guide                          |
| [Domain errors](./src/domain/errors/README.md)        | Error classes and codes                    |
| [Value objects](./src/domain/value-objects/README.md) | VO reference                               |
| [FUTURE.md](./FUTURE.md)                              | Aspirational design (not implemented)      |

## Quick Example

```typescript
import {
  AuthenticationAttempt,
  AuthAttemptId,
  AuthMethodPort,
} from '@rineex/auth-core';

// Register an AuthMethodPort implementation (e.g. OtpAuthMethod) at composition root
// Wire AuthenticationAttemptRepositoryPort, IdentityRepository, DomainEventPublisherPort
```

See `@rineex/authentication-method-otp` for a complete method adapter.

## Development

```bash
pnpm build
pnpm test
pnpm lint
pnpm check-types
```

## License

Apache-2.0
