# Auth Core — Architecture (As Implemented)

Framework-agnostic authentication core built on `@rineex/ddd`. This document
describes **what exists in code today**, not aspirational designs. For planned
features (Flow DSL, Principal/Credential model), see [FUTURE.md](./FUTURE.md).

## Purpose

- Orchestrate authentication attempts via pluggable auth methods
- Enforce policy decisions before and during authentication
- Emit domain events for attempt lifecycle
- Stay independent of HTTP, databases, and token formats

## Packages

| Package                                      | Role                                                            |
| -------------------------------------------- | --------------------------------------------------------------- |
| `@rineex/auth-core`                          | Shared identity model, attempt aggregate, policy engine, ports  |
| `@rineex/authentication-method-otp`          | `AuthMethodPort` adapter for OTP                                |
| `@rineex/authentication-method-passwordless` | Standalone challenge issue/verify (not yet on `AuthMethodPort`) |

## Bounded Context

**In scope:** verifying proof of access, attempt orchestration, policy
evaluation.

**Out of scope:** user profiles, authorization/permissions, HTTP, UI, concrete
token formats, database schemas.

## Ubiquitous Language (Implemented)

| Term         | Meaning in code                                                      |
| ------------ | -------------------------------------------------------------------- |
| Identity     | Actor that can authenticate (`Identity` entity, exported)            |
| Auth Attempt | One authentication execution (`AuthenticationAttempt` aggregate)     |
| Auth Method  | Concrete mechanism (`AuthMethod` VO; `AuthMethodPort` for plugins)   |
| Auth Factor  | Category of proof (`AuthFactor` VO)                                  |
| Auth Policy  | Named policy slot (`AuthPolicy` VO; evaluated by `AuthPolicyEngine`) |
| Session      | Post-auth continuity (`Session` entity — in-tree, not exported)      |
| MFA Session  | Step-up verification context (`MFASession` aggregate — in-tree)      |

**Not implemented:** Principal, Credential, Auth Proof, TrustLevel, Flow DSL.

> **Naming note:** Two types named `Identity` exist — an **entity** (exported)
> and an **aggregate** (in-tree, unexported). Prefer the entity in new code
> until the aggregate is published or renamed.

## Public Surface vs In-Tree

### Exported from `@rineex/auth-core`

- **Aggregate:** `AuthenticationAttempt`
- **Entity:** `Identity`
- **Value objects:** `AuthAttemptId`, `AuthFactor`, `AuthMethod`, `AuthPolicy`,
  `AuthStatus`, `IdentityId`, `IdentityProvider`, `RiskSignal`
- **Events:** `AuthenticationStartedEvent`, `AuthenticationFailedEvent`,
  `AuthenticationSucceededEvent`
- **Policy:** `AuthPolicyEvaluator`, `AuthPolicyContext`, `AuthPolicyDecision`,
  `AuthPolicyEngine`
- **Ports:** `AuthMethodPort`, `AuthenticationAttemptRepositoryPort`,
  `IdentityRepository`, `DomainEventPublisherPort`

### In-tree (not exported)

- Domains: MFA, OAuth, session, token
- Application services: flow start/verify, MFA start/issue/verify, OAuth
  authorize (stub)
- Error registries and most domain errors
- Additional repository and observability ports

## Core Aggregates and Entities

### AuthenticationAttempt (exported aggregate)

Lifecycle: `pending` → `succeed` | `failed`.

Methods: `start`, `fail`, `registerAttempt`, `succeed`. Emits started, failed,
succeeded events.

### Identity (exported entity)

Represents an authenticatable actor. Distinct from the unexported Identity
aggregate in `identity.aggregate.ts`.

### Session (entity, unexported)

Holds `identityId`, token reference, expiry, revocation. Not an aggregate root.

### MFASession, OauthAuthorization, Token (unexported)

Domain models exist with application services partially implemented. Not on the
public package entry.

## Auth Method Integration

### AuthMethodPort (OTP)

```typescript
type AuthMethodPort = {
  readonly method: AuthMethodName;
  start(params: {
    authAttemptId: AuthAttemptId;
    ctx: unknown;
  }): AuthMethodOutcome | Promise<AuthMethodOutcome>;
  verify(params: {
    authAttemptId: AuthAttemptId;
    payload: unknown;
  }): AuthMethodOutcome | Promise<AuthMethodOutcome>;
};
```

`OtpAuthMethod` in `@rineex/authentication-method-otp` implements this port.

### Passwordless (standalone)

`IssuePasswordlessChallengeService` and `VerifyPasswordlessChallengeService`
live in the passwordless package. They are **not** wired through
`AuthMethodPort` today. See passwordless package README.

## Policy Engine

`AuthPolicyEngine` runs registered `AuthPolicyEvaluator` instances. First deny
wins. Evaluators may return `requiresStepUp` for MFA escalation. No declarative
policy DSL — evaluators are code.

## Error Pattern

Per bounded context:

1. Const registry: `AuthCoreErrorRegistry` with namespaces (`AUTH_CORE_MFA`,
   etc.)
2. Error classes extend `DomainError<'NAMESPACE.CODE', Meta>`
3. Architecture tests verify every error code is registered

See [src/domain/errors/README.md](./src/domain/errors/README.md).

## Layering

```
┌─────────────────────────────────────┐
│  Application (flow + MFA services)  │  unexported
├─────────────────────────────────────┤
│  Domain (attempt, identity, policy) │  partially exported
├─────────────────────────────────────┤
│  Ports (inbound + outbound)         │  partially exported
└─────────────────────────────────────┘
         ▲
         │ adapters (consumer-provided)
```

## Hard Rules (still apply)

1. Authentication is not identity management
2. Auth methods are plugins (`AuthMethodPort`)
3. Infrastructure stays outside domain
4. Domain owns invariants only
5. New methods must not require changing `AuthenticationAttempt`

## Related Docs

- [Definition.md](./Definition.md) — contracts and registries
- [RULES.md](./RULES.md) — package topology and port map
- [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) — remaining work
- [ONBOARDING.md](./ONBOARDING.md) — contributor guide
