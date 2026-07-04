# Authentication Domain Errors

Domain error classes for `@rineex/auth-core`. All extend `DomainError` from
`@rineex/ddd` using the v6 registry-backed, code-first API.

## Error Structure

Every domain error has:

- **code**: Machine-readable `NAMESPACE.ERROR_NAME` literal (e.g.
  `AUTH_CORE_TOKEN.INVALID`)
- **message**: Human-readable description
- **metadata**: Optional primitive context (`Metadata<T>` from `@rineex/ddd`)

There is **no `type` field** — removed in `@rineex/ddd` v6. Use `code` for
classification.

## Registry Pattern

```typescript
import { InferErrorCodes } from '@rineex/ddd';

export const AuthCoreErrorRegistry = {
  AUTH_CORE_TOKEN: ['INVALID'],
  // ... other namespaces
} as const;

export type AuthCoreDomainErrorCode = InferErrorCodes<
  typeof AuthCoreErrorRegistry
>;
```

Architecture tests in `__tests__/auth-core-error.architecture.spec.ts` verify
every error class code is registered.

## Namespaces

### AUTH_CORE_TOKEN

| Code      | Class                   | Metadata                    |
| --------- | ----------------------- | --------------------------- |
| `INVALID` | `InvalidAuthTokenError` | `actualLength`, `minLength` |

### AUTH_CORE_SESSION

| Code      | Class                 |
| --------- | --------------------- |
| `INVALID` | `InvalidSessionError` |

### AUTH_CORE_SCOPE

| Code      | Class               |
| --------- | ------------------- |
| `INVALID` | `InvalidScopeError` |

### AUTH_CORE_IDENTITY

| Code                 | Class                                  |
| -------------------- | -------------------------------------- |
| `DISABLED_ERROR`     | `IdentityDisabledError`                |
| `INVALID_TRANSITION` | `InvalidAuthenticationTransitionError` |

### AUTH_CORE_ATTEMPT

| Code                    | Class                           |
| ----------------------- | ------------------------------- |
| `AUTHENTICATION_FAILED` | `AuthenticationAttemptError`    |
| `NOT_FOUND`             | `AuthenticationAttemptNotFound` |

### AUTH_CORE_MFA

| Code                       | Class                           |
| -------------------------- | ------------------------------- |
| `CHALLENGE_ID_INVALID`     | MFA challenge ID errors         |
| `CHALLENGE_STATUS_INVALID` | Invalid MFA challenge status    |
| `CHALLENGE_EXPIRED`        | `MfaChallengeExpiredError`      |
| `EXPIRED`                  | `MfaExpiredError`               |
| `ALREADY_VERIFIED`         | `MfaAlreadyVerifiedError`       |
| `ACTIVE_CHALLENGE_EXISTS`  | `MfaActiveChallengeExistsError` |
| `ATTEMPTS_EXCEEDED`        | `MfaAttemptsExceededError`      |
| `SESSION_ID_INVALID`       | MFA session ID errors           |

### AUTH_CORE_OAUTH

| Code                         | Class                           |
| ---------------------------- | ------------------------------- |
| `INVALID_PROVIDER`           | `InvalidOauthProviderError`     |
| `INVALID_REDIRECT_URI`       | `InvalidRedirectUriError`       |
| `AUTHORIZATION_ALREADY_USED` | `AuthorizationAlreadyUsedError` |
| `INVALID_PKCE`               | `InvalidPkceError`              |
| `INVALID_AUTHORIZATION_CODE` | `InvalidAuthorizationCodeError` |
| `CONSENT_REQUIRED`           | `ConsentRequiredError`          |
| `AUTHORIZATION_EXPIRED`      | `AuthorizationExpiredError`     |

## Usage

```typescript
throw InvalidAuthTokenError.create('Authentication token is invalid', {
  actualLength: 20,
  minLength: 32,
});

throw InvalidSessionError.create();
```

## Serialization

`toObject()` returns `{ code, message, metadata }` — no `type` field.

## Related

- Registry: `auth-core-error.registry.ts`
- Base class: `auth-domain.error.ts` (optional base; most errors extend
  `DomainError` directly)
- Passwordless errors: separate `PasswordlessErrorRegistry` in passwordless
  package
- OTP errors: `OtpErrorRegistry` in OTP package
  (`AUTH_OTP.AUTHENTICATION_FAILED`)
