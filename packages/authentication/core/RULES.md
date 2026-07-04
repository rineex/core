# Auth Core — Package Topology and Port Map

Actual layout as implemented. The `@auth/core-domain` / `@auth/core-ports` split
described in earlier drafts was never built — everything lives in
`@rineex/auth-core` with method packages alongside.

## Package Topology

```
packages/authentication/
├── core/                    @rineex/auth-core
│   ├── domain/              identity, policy, mfa, oauth, session, token
│   ├── application/         flow + MFA services (unexported)
│   ├── ports/               inbound + outbound
│   └── types/               registries
└── methods/
    ├── otp/                 @rineex/authentication-method-otp
    └── passwordless/        @rineex/authentication-method-passwordless
```

No `adapters/`, `orchestration/`, or `policies/` packages exist at this level.
Framework adapters are consumer responsibilities.

## Dependency Rules

| Package                                      | May depend on                         |
| -------------------------------------------- | ------------------------------------- |
| `@rineex/auth-core`                          | `@rineex/ddd`                         |
| `@rineex/authentication-method-otp`          | `@rineex/auth-core`, `@rineex/ddd`    |
| `@rineex/authentication-method-passwordless` | `@rineex/auth-core`, `@rineex/ddd`    |
| Consumer apps                                | Any of the above + their own adapters |

Method packages must not import each other.

## Inbound Ports

| Port                         | Path                                  | Implemented by  |
| ---------------------------- | ------------------------------------- | --------------- |
| `AuthMethodPort`             | `ports/inbound/auth-method.port.ts`   | `OtpAuthMethod` |
| `StartAuthenticationCommand` | `ports/inbound/start-auth.command.ts` | Consumer        |

## Outbound Ports (exported)

| Port                                  | Path                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `AuthenticationAttemptRepositoryPort` | `ports/outbound/authentication-attempt.repository.port.ts` |
| `IdentityRepository`                  | `ports/outbound/identity.repository.outbound.port.ts`      |
| `DomainEventPublisherPort`            | `ports/outbound/domain-event-publisher.port.ts`            |

## Outbound Ports (in-tree)

| Port                     | Path                                              |
| ------------------------ | ------------------------------------------------- |
| `SessionRepositoryPort`  | `ports/outbound/session.repository.port.ts`       |
| `TokenRepository`        | `ports/repositories/token.repository.ts`          |
| `MfaSessionRepository`   | `ports/mfa/mfa-session-repository.port.ts`        |
| `MfaSessionIdGenerator`  | `ports/mfa/mfa-session-id-generator.port.ts`      |
| `MfaClock`               | `ports/mfa/mfa-clock.port.ts`                     |
| `LoggerPort`             | `ports/log/log.port.ts`                           |
| `ObservabilityEventPort` | `ports/observability/observability-event.port.ts` |

## Passwordless Ports (passwordless package)

| Port                              | Path                                           |
| --------------------------------- | ---------------------------------------------- |
| `PasswordlessChallengeRepository` | `methods/passwordless/src/ports/repositories/` |
| `PasswordlessChannelPort`         | `methods/passwordless/src/ports/channels/`     |
| `PasswordlessIdGeneratorPort`     | `methods/passwordless/src/ports/`              |

## OTP Ports

| Port             | Package                                        |
| ---------------- | ---------------------------------------------- |
| `OtpChannelPort` | `@rineex/authentication-method-otp` (exported) |

## Layer Rules

1. Domain must not import application or infrastructure
2. Application orchestrates domain + ports
3. Ports are interfaces only — no implementations in core
4. Method packages implement inbound ports; consumers implement outbound ports
5. Domain throws `DomainError`; application services return `Result` (v5+ API)

## Export Policy

Only symbols re-exported from `core/src/index.ts` are public API. In-tree
domains (MFA, OAuth, session, token) are internal until explicitly exported.

See [Architecture.md](./Architecture.md) for the full exported vs in-tree list.
