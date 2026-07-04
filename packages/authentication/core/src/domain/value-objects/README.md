# Authentication Domain Value Objects

Value objects in `@rineex/auth-core`. Immutable, validated domain concepts.

## Exported (public API)

Available from `@rineex/auth-core` via `src/index.ts`:

| VO                 | Description                                        |
| ------------------ | -------------------------------------------------- |
| `AuthAttemptId`    | UUID identifier for authentication attempts        |
| `AuthFactor`       | Auth factor name (registry: `password`)            |
| `AuthMethod`       | Auth method name (registry: `passwordless`, `otp`) |
| `AuthPolicy`       | Policy name (registry: `base`)                     |
| `AuthStatus`       | Attempt status: `pending`, `succeed`, `failed`     |
| `IdentityId`       | UUID identifier for identities                     |
| `IdentityProvider` | Provider name (registry currently empty)           |
| `RiskSignal`       | Risk signal name (registry currently empty)        |

### Examples

```typescript
import { AuthAttemptId, AuthStatus, IdentityId } from '@rineex/auth-core';

const attemptId = AuthAttemptId.generate();
const status = AuthStatus.pending();
const identityId = IdentityId.fromString(
  '550e8400-e29b-41d4-a716-446655440000',
);
```

## In-tree (not exported)

### Identity

- `IdentityStatus` — used by unexported Identity aggregate

### MFA

| VO                   | Description                                |
| -------------------- | ------------------------------------------ |
| `MfaChallengeId`     | MFA challenge UUID                         |
| `MfaSessionId`       | MFA session UUID                           |
| `MfaChallengeStatus` | `pending`, `verified`, `expired`, `failed` |

### OAuth

| VO                                      | Description              |
| --------------------------------------- | ------------------------ |
| `OauthAuthorizationId`                  | OAuth authorization UUID |
| `AuthorizationCodeId`                   | Authorization code ID    |
| `AuthorizationCode`                     | OAuth authorization code |
| `ClientId`                              | OAuth client identifier  |
| `CodeChallenge` / `CodeChallengeMethod` | PKCE                     |
| `Pkce`                                  | PKCE bundle              |
| `OauthProvider`                         | Provider name            |
| `RedirectUri`                           | Redirect URI             |
| `Scope` / `ScopeSet`                    | OAuth scopes             |

### Session

| VO          | Description  |
| ----------- | ------------ |
| `SessionId` | Session UUID |

### Token

| VO             | Description                                     |
| -------------- | ----------------------------------------------- |
| `AuthToken`    | Abstract cryptographic token (not JWT-specific) |
| `SessionToken` | Session-scoped token                            |

## MFA Value Object Details

### MfaChallengeStatus

```typescript
const status = MfaChallengeStatus.pending();
const verified = MfaChallengeStatus.create('verified');
```

Throws `InvalidMfaChallengeStatusError` for invalid values.

### AuthToken

Abstract base — concrete formats (JWT, opaque) live in consumer adapters.
Minimum length: 32 characters. Throws `InvalidAuthTokenError`.

## Guidelines

1. **Immutability** — never mutate VO values after construction
2. **Equality** — use `equals()`, not `===` (except primitives inside)
3. **Validation** — happens at construction; throws `DomainError` or
   `InvalidValueObjectError`
4. **Serialization** — use `.value` or `toString()`

## Known gaps

- `OtpCode` in core throws generic `Error` — migrate to domain error (see
  GAP_ANALYSIS.md)
- `IdentityStatus` not exported despite use in Identity aggregate
