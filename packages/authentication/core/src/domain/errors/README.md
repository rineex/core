# Authentication Domain Errors

## Overview

This document describes the domain error classes used in the authentication core
package. All errors extend `DomainError` from `@rineex/ddd` and follow a
consistent pattern for error handling and reporting.

## Error Structure

All domain errors follow this structure:

- **code**: Machine-readable error code in format `NAMESPACE.ERROR_NAME`
- **message**: Human-readable error message
- **type**: Error category (`DOMAIN.INVALID_STATE` or `DOMAIN.INVALID_VALUE`)
- **metadata**: Optional structured context (primitive values only)

## Core Domain Errors

### InvalidAuthTokenError

Raised when an authentication token violates domain invariants.

**Code**: `AUTH_CORE_TOKEN.INVALID`  
**Type**: `DOMAIN.INVALID_VALUE`

**Metadata**:

- `actualLength`: number - Actual token length
- `minLength`: number - Minimum required length (32)

**Example**:

```typescript
throw InvalidAuthTokenError.create('Authentication token is invalid', {
  actualLength: 20,
  minLength: 32,
});
```

### InvalidSessionError

Raised when a session invariant is violated.

**Code**: `AUTH_CORE_SESSION.INVALID`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
throw InvalidSessionError.create();
```

### InvalidScopeError

Raised when a scope format is invalid.

**Code**: `AUTH_CORE_SCOPE.INVALID`  
**Type**: `DOMAIN.INVALID_VALUE`

**Metadata**:

- `scope`: string - The invalid scope value

**Example**:

```typescript
throw InvalidScopeError.create('Scope format is invalid', {
  scope: 'invalid scope format',
});
```

## MFA Errors

### MfaChallengeExpiredError

Raised when an MFA challenge has expired.

**Code**: `AUTH_CORE_MFA.CHALLENGE_EXPIRED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (challenge.isExpired(now)) {
  throw MfaChallengeExpiredError.create();
}
```

### MfaExpiredError

Raised when an MFA challenge or session has expired.

**Code**: `AUTH_CORE_MFA.EXPIRED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (mfaSession.isExpired(now)) {
  throw MfaExpiredError.create();
}
```

### MfaAlreadyVerifiedError

Raised when an MFA session is already verified.

**Code**: `AUTH_CORE_MFA.ALREADY_VERIFIED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (mfaSession.isVerified()) {
  throw MfaAlreadyVerifiedError.create();
}
```

### MfaActiveChallengeExistsError

Raised when attempting to create a new MFA challenge while an active one already
exists.

**Code**: `AUTH_CORE_MFA.ACTIVE_CHALLENGE_EXISTS`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (await hasActiveChallenge(identityId)) {
  throw MfaActiveChallengeExistsError.create();
}
```

### MfaAttemptsExceededError

Raised when the maximum number of MFA verification attempts has been exceeded.

**Code**: `AUTH_CORE_MFA.ATTEMPTS_EXCEEDED`  
**Type**: `DOMAIN.INVALID_STATE`

**Metadata**:

- `attemptsUsed`: number - Number of attempts that were used
- `maxAttempts`: number - Maximum number of allowed attempts

**Example**:

```typescript
if (attempts >= maxAttempts) {
  throw MfaAttemptsExceededError.create(attempts, maxAttempts);
}
```

## OAuth Errors

### InvalidOAuthProviderError

Raised when an OAuth provider identifier is invalid.

**Code**: `AUTH_CORE_OAUTH.INVALID_PROVIDER`  
**Type**: `DOMAIN.INVALID_VALUE`

**Metadata**:

- `value`: string - The invalid provider identifier

**Example**:

```typescript
throw InvalidOAuthProviderError.create({ value: 'invalid_provider' });
```

### InvalidRedirectUriError

Raised when a redirect URI is invalid or insecure.

**Code**: `AUTH_CORE_OAUTH.INVALID_REDIRECT_URI`  
**Type**: `DOMAIN.INVALID_VALUE`

**Metadata**:

- `redirectUri`: string - The invalid redirect URI

**Example**:

```typescript
throw InvalidRedirectUriError.create({ redirectUri: 'http://insecure.com' });
```

### AuthorizationAlreadyUsedError

Raised when an OAuth authorization has already been used.

**Code**: `AUTH_CORE_OAUTH.AUTHORIZATION_ALREADY_USED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (authorization.isUsed()) {
  throw AuthorizationAlreadyUsedError.create();
}
```

### InvalidPkceError

Raised when PKCE (Proof Key for Code Exchange) parameters are invalid.

**Code**: `AUTH_CORE_OAUTH.INVALID_PKCE`  
**Type**: `DOMAIN.INVALID_VALUE`

**Example**:

```typescript
throw InvalidPkceError.create({ reason: 'code_verifier_mismatch' });
```

### InvalidAuthorizationCodeError

Raised when an authorization code is invalid.

**Code**: `AUTH_CORE_OAUTH.INVALID_AUTHORIZATION_CODE`  
**Type**: `DOMAIN.INVALID_VALUE`

**Example**:

```typescript
throw InvalidAuthorizationCodeError.create({ code: 'invalid_code' });
```

### ConsentRequiredError

Raised when user consent is required for an OAuth authorization.

**Code**: `AUTH_CORE_OAUTH.CONSENT_REQUIRED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (!hasConsent(clientId, userId, scopes)) {
  throw ConsentRequiredError.create();
}
```

### AuthorizationExpiredError

Raised when an OAuth authorization has expired.

**Code**: `AUTH_CORE_OAUTH.AUTHORIZATION_EXPIRED`  
**Type**: `DOMAIN.INVALID_STATE`

**Example**:

```typescript
if (authorization.isExpired(now)) {
  throw AuthorizationExpiredError.create();
}
```

## OTP Errors

### OtpAuthenticationError

Raised when OTP authentication fails.

**Code**: `AUTH_OTP.AUTHENTICATION_FAILED`  
**Type**: `DOMAIN.INVALID_STATE`

**Metadata**:

- `attemptsUsed?`: number - Number of attempts used
- `reason?`: string - Reason for failure

**Example**:

```typescript
throw OtpAuthenticationError.create('Invalid or expired OTP code', {
  attemptsUsed: 3,
  reason: 'code_mismatch',
});
```

## Usage Guidelines

1. **Error Creation**: Always use the static `create()` method when available
2. **Error Handling**: Catch domain errors at the application or adapter layer
3. **Error Messages**: Keep messages user-friendly but informative
4. **Metadata**: Include relevant context in metadata for debugging
5. **Error Types**: Use `DOMAIN.INVALID_STATE` for state violations,
   `DOMAIN.INVALID_VALUE` for value violations

## Serialization

All errors can be serialized using `toObject()`:

```typescript
const error = InvalidAuthTokenError.create('Token invalid', {
  actualLength: 20,
  minLength: 32,
});

const serialized = error.toObject();
// {
//   code: 'AUTH_CORE_TOKEN.INVALID',
//   message: 'Token invalid',
//   type: 'DOMAIN.INVALID_VALUE',
//   metadata: { actualLength: 20, minLength: 32 }
// }
```

## String Representation

Errors can be converted to strings using `toString()`:

```typescript
const error = InvalidSessionError.create();
console.log(error.toString());
// Output: [AUTH_CORE_SESSION.INVALID] Session state is invalid
```
