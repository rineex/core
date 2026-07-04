# Auth Core — Definition (As Implemented)

Contracts, registries, and integration patterns that exist in code today. For
aspirational Flow DSL, proof system, and Principal/Credential model, see
[FUTURE.md](./FUTURE.md).

## AuthMethodPort

All auth method modules should implement this inbound port:

| Method   | Purpose                                                            |
| -------- | ------------------------------------------------------------------ |
| `start`  | Initiate the method (send OTP, redirect to OAuth, issue challenge) |
| `verify` | Verify a response (OTP code, callback payload)                     |

Returns `AuthMethodOutcome` — `{ ok: true }` or
`{ ok: false, violation: UseCaseError }`. This is **not** `Result<T>`; `Result`
is used at the application layer.

**Implemented adapter:** `OtpAuthMethod` (`@rineex/authentication-method-otp`).

**Not yet adapted:** passwordless (standalone services only).

## Flow Orchestration

`StartAuthenticationFlowApplicationService` and
`VerifyAuthenticationFlowApplicationService` resolve a registered
`AuthMethodPort` and delegate to `start` / `verify` on an
`AuthenticationAttempt`. This is **not** a data-driven Flow DSL — it is direct
method dispatch.

## Policy Evaluation

| Type                  | Role                                             |
| --------------------- | ------------------------------------------------ |
| `AuthPolicyEvaluator` | Evaluates one policy; returns allow/deny/step-up |
| `AuthPolicyEngine`    | Runs evaluators; first deny wins                 |
| `AuthPolicyContext`   | Input snapshot for evaluation                    |
| `AuthPolicyDecision`  | Outcome: allowed, denied, or requires step-up    |

Policies are registered by name via `AuthPolicyRegistry` (currently `base`
only).

## Type Registries

Closed registries extended via module augmentation:

| Registry                   | Current values                                       |
| -------------------------- | ---------------------------------------------------- |
| `AuthMethodRegistry`       | `passwordless`, `otp` (augmented by method packages) |
| `AuthFactorRegistry`       | `password`                                           |
| `AuthPolicyRegistry`       | `base`                                               |
| `IdentityProviderRegistry` | (empty)                                              |
| `RiskSignalRegistry`       | (empty)                                              |

## Error Registry

`AuthCoreErrorRegistry` namespaces:

- `AUTH_CORE_MFA` — challenge/session MFA errors
- `AUTH_CORE_OAUTH` — OAuth authorization errors
- `AUTH_CORE_IDENTITY` — identity state errors
- `AUTH_CORE_ATTEMPT` — attempt failures and not-found
- `AUTH_CORE_SESSION` — session invalid
- `AUTH_CORE_TOKEN` — token invalid
- `AUTH_CORE_SCOPE` — scope invalid

Pattern:

```typescript
import { DomainError, InferErrorCodes, Metadata } from '@rineex/ddd';

export const AuthCoreErrorRegistry = { AUTH_CORE_TOKEN: ['INVALID'] } as const;
export type AuthCoreDomainErrorCode = InferErrorCodes<
  typeof AuthCoreErrorRegistry
>;

class InvalidAuthTokenError extends DomainError<
  'AUTH_CORE_TOKEN.INVALID',
  Metadata<{ actualLength: number }>
> {
  readonly code = 'AUTH_CORE_TOKEN.INVALID' as const;
}
```

## Authentication Attempt States

| Status    | Meaning                  |
| --------- | ------------------------ |
| `pending` | Attempt in progress      |
| `succeed` | Authentication succeeded |
| `failed`  | Authentication failed    |

## Outbound Ports (exported)

| Port                                  | Responsibility        |
| ------------------------------------- | --------------------- |
| `AuthenticationAttemptRepositoryPort` | Persist attempts      |
| `IdentityRepository`                  | Load identities       |
| `DomainEventPublisherPort`            | Publish domain events |

## Outbound Ports (in-tree)

`SessionRepositoryPort`, `TokenRepository`, `MfaSessionRepository`,
`MfaSessionIdGenerator`, `MfaClock`, `LoggerPort`, `ObservabilityEventPort`.

## MFA Application Services (in-tree)

- `StartMfaSessionApplicationService`
- `IssueMfaChallengeApplicationService`
- `VerifyMfaApplicationService`

## OAuth (in-tree, incomplete)

Domain model for OAuth authorization with PKCE value objects exists.
`OAuthAuthorizeService` is a stub.

## Passwordless Package

Separate package with its own aggregate, error registry, and issue/verify
services. See
[methods/passwordless/README.md](../methods/passwordless/README.md).

**Known gap:** package `index.ts` does not export runtime API — only type
augmentation. See [GAP_ANALYSIS.md](./GAP_ANALYSIS.md).
