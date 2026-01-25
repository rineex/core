# Authentication Domain Value Objects

## Overview

This document describes the value objects used in the authentication core
package. Value objects are immutable domain concepts that represent values
rather than entities with identity.

## MFA Value Objects

### MfaChallengeId

Represents the unique identifier for an MFA challenge.

**Extends**: `DomainID` from `@rineex/ddd`

**Methods**:

- `static generate()`: Creates a new UUID-based challenge ID
- `static fromString(value: string)`: Creates from a UUID string
- `toString()`: Returns the UUID string representation

**Example**:

```typescript
// Generate a new challenge ID
const challengeId = MfaChallengeId.generate();

// Create from string
const challengeId = MfaChallengeId.fromString(
  '550e8400-e29b-41d4-a716-446655440000',
);
```

### MfaSessionId

Represents the unique identifier for an MFA session.

**Extends**: `DomainID` from `@rineex/ddd`

**Methods**:

- `static generate()`: Creates a new UUID-based session ID
- `static fromString(value: string)`: Creates from a UUID string
- `toString()`: Returns the UUID string representation

**Example**:

```typescript
// Generate a new session ID
const sessionId = MfaSessionId.generate();

// Create from string
const sessionId = MfaSessionId.fromString(
  '550e8400-e29b-41d4-a716-446655440000',
);
```

### MfaChallengeStatus

Represents the status of an MFA challenge.

**Extends**: `PrimitiveValueObject<string>` from `@rineex/ddd`

**Valid Values**:

- `'pending'`: Challenge has been issued but not yet verified
- `'verified'`: Challenge has been successfully verified
- `'expired'`: Challenge has expired without being verified
- `'failed'`: Challenge verification failed

**Methods**:

- `static create(value: MfaChallengeStatusValue)`: Creates a status from a
  string value
- `static pending()`: Creates a pending status
- `static verified()`: Creates a verified status
- `toString()`: Returns the status string

**Example**:

```typescript
// Create a pending status
const status = MfaChallengeStatus.pending();

// Create from string
const status = MfaChallengeStatus.create('verified');

// Check value
if (status.value === 'pending') {
  // Handle pending challenge
}
```

**Validation**: Throws `InvalidMfaChallengeStatusError` if value is not in the
allowed list.

## Token Value Objects

### AuthToken

Abstract base class representing a cryptographic authentication token.

**Extends**: `PrimitiveValueObject<string>` from `@rineex/ddd`

**Important Notes**:

- This is NOT a JWT
- This is NOT a bearer string
- This is a domain-level proof of authentication
- Concrete formats (JWT, opaque tokens, etc.) live in adapters

**Abstract Properties**:

- `readonly type: string`: Token type identifier (e.g., 'JWT', 'OPAQUE')

**Validation**:

- Minimum length: 32 characters
- Throws `InvalidAuthTokenError` if validation fails

**Example**:

```typescript
class JwtAuthToken extends AuthToken {
  readonly type = 'JWT';

  static fromString(value: string): JwtAuthToken {
    return new JwtAuthToken(value);
  }
}

const token = JwtAuthToken.fromString('a'.repeat(32));
```

## OTP Value Objects

### OtpCode

Represents a One-Time Password (OTP) code.

**Extends**: `PrimitiveValueObject<string>` from `@rineex/ddd`

**Format**: 6-digit numeric string (e.g., '123456')

**Methods**:

- `static create(value: string)`: Creates an OTP code from a string
- `toString()`: Returns the OTP code string

**Example**:

```typescript
// Create an OTP code
const code = OtpCode.create('123456');

// Access the value
const value = code.value; // '123456'
```

**Validation**:

- Must be exactly 6 digits
- Must match pattern `/^\d{6}$/`
- Throws `Error` if validation fails

## Usage Guidelines

1. **Immutability**: Value objects are immutable - never modify their values
2. **Equality**: Use `equals()` method for comparison, not `===`
3. **Validation**: Validation happens during construction
4. **Serialization**: Use `toString()` or `value` property for serialization
5. **Type Safety**: Use TypeScript types to ensure correct usage

## Common Patterns

### Creating Value Objects

```typescript
// From string
const id = MfaChallengeId.fromString('uuid-string');

// Generate new
const id = MfaChallengeId.generate();

// From primitive
const status = MfaChallengeStatus.create('pending');
```

### Comparing Value Objects

```typescript
const id1 = MfaChallengeId.fromString('uuid-1');
const id2 = MfaChallengeId.fromString('uuid-2');

// Use equals() method
if (id1.equals(id2)) {
  // IDs are equal
}
```

### Serialization

```typescript
const status = MfaChallengeStatus.pending();

// To string
const str = status.toString(); // 'pending'

// To primitive value
const value = status.value; // 'pending'
```

## Error Handling

All value objects validate their values during construction and throw domain
errors when validation fails:

- `MfaChallengeStatus`: Throws `InvalidMfaChallengeStatusError`
- `AuthToken`: Throws `InvalidAuthTokenError`
- `OtpCode`: Throws generic `Error` (consider migrating to domain error)
