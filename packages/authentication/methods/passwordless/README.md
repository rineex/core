# @rineex/authentication-method-passwordless

Passwordless authentication method for the Rineex authentication system.
Implements a DDD-based challenge-response flow supporting multiple delivery
channels (email, SMS, push notifications, authenticator apps).

## Overview

### What This Component Does

- Manages the lifecycle of passwordless authentication challenges (OTP codes,
  push nonces, etc.)
- Provides a channel-agnostic architecture for delivering secrets via email,
  SMS, push, or authenticator apps
- Emits domain events for challenge issuance and verification
- Uses timing-safe secret comparison to prevent timing attacks

### When to Use

- Implementing passwordless login flows (magic links, OTP codes)
- Building multi-factor authentication with OTP verification
- Creating authentication systems that don't rely on passwords

### When NOT to Use

- Password-based authentication (use a separate auth method)
- Session management (this only handles challenge verification, not session
  creation)
- Direct integration without implementing required ports (repository, channel,
  ID generator)

## Installation

```bash
pnpm add @rineex/authentication-method-passwordless
```

## Public API

### PasswordlessChallengeAggregate

The aggregate root managing passwordless challenge state and behavior.

#### Static Methods

| Method    | Parameters                | Returns                          | Description                                                                     |
| --------- | ------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `issue()` | `CreatePasswordlessProps` | `PasswordlessChallengeAggregate` | Creates and issues a new challenge, emitting `PasswordlessChallengeIssuedEvent` |

#### Instance Methods

| Method            | Parameters                     | Returns   | Description                                                     |
| ----------------- | ------------------------------ | --------- | --------------------------------------------------------------- |
| `verify()`        | `secret: string`, `now?: Date` | `void`    | Verifies the challenge with provided secret. Throws on failure. |
| `isExpired()`     | `now?: Date`                   | `boolean` | Checks if challenge has expired                                 |
| `matchesSecret()` | `input: string`                | `boolean` | Timing-safe secret comparison                                   |
| `toObject()`      | -                              | `object`  | Returns plain object representation                             |
| `validate()`      | -                              | `void`    | Validates aggregate invariants                                  |

#### Errors Thrown by `verify()`

| Error                                 | Condition                             |
| ------------------------------------- | ------------------------------------- |
| `PasswordlessChallengeExpired`        | Challenge has passed expiration time  |
| `PasswordlessChallengeAlreadyUsedErr` | Challenge already verified or expired |
| `PasswordlessChallengeSecretMismatch` | Provided secret doesn't match         |

### IssuePasswordlessChallengeService

Application service for issuing new passwordless challenges.

#### Constructor

```typescript
constructor(
  repository: PasswordlessChallengeRepository,
  idGenerator: PasswordlessIdGeneratorPort,
  clock: ClockPort
)
```

#### Methods

| Method      | Parameters | Returns                                                  | Description                          |
| ----------- | ---------- | -------------------------------------------------------- | ------------------------------------ |
| `execute()` | `Input`    | `Promise<Result<PasswordlessChallengeAggregate, Error>>` | Creates and persists a new challenge |

#### Input Type

```typescript
type Input = {
  channel: PasswordlessChannel;
  destination: ChallengeDestination;
  secret: ChallengeSecret;
  ttlSeconds?: ms.StringValue; // Default: '300s' (5 minutes)
};
```

### Value Objects

| Class                         | Factory Method                        | Validation                                                     |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| `PasswordlessChannel`         | `create(channel)`                     | Must be `'email'`, `'sms'`, `'authenticator_app'`, or `'push'` |
| `ChallengeDestination`        | `create(value)`                       | Minimum 3 characters                                           |
| `ChallengeSecret`             | `create(value)`                       | Minimum 4 characters                                           |
| `OtpCode`                     | `create(value)`                       | Exactly 6 digits                                               |
| `PasswordlessChallengeId`     | `fromString(id)`                      | Valid domain ID                                                |
| `PasswordlessChallengeStatus` | `issued()`, `verified()`, `expired()` | Enum-like, closed union                                        |

### Domain Events

| Event                                | Event Name                             | Payload                                |
| ------------------------------------ | -------------------------------------- | -------------------------------------- |
| `PasswordlessChallengeIssuedEvent`   | `auth.passwordless.challenge_created`  | `{ channel, destination, expiresAt }`  |
| `PasswordlessChallengeVerifiedEvent` | `auth.passwordless.challenge_verified` | `{ channel, destination, verifiedAt }` |

### Ports (Interfaces to Implement)

#### PasswordlessChallengeRepository

```typescript
type PasswordlessChallengeRepository = {
  save: (challenge: PasswordlessChallengeAggregate) => Promise<void>;
};
```

#### PasswordlessSessionRepository

Extended repository with query methods:

```typescript
interface PasswordlessSessionRepository {
  save: (challenge: PasswordlessChallengeAggregate) => Promise<void>;
  findById: (
    id: PasswordlessChallengeId,
  ) => Promise<PasswordlessChallengeAggregate | null>;
  findActiveByEmail: (
    email: Email,
  ) => Promise<PasswordlessChallengeAggregate | null>;
}
```

#### PasswordlessChannelPort

```typescript
type PasswordlessChannelPort = {
  readonly channelName: PasswordlessChannel;
  deliver: (
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ) => Promise<void>;
};
```

#### PasswordlessIdGeneratorPort

```typescript
type PasswordlessIdGeneratorPort = {
  generate: () => PasswordlessChallengeId;
};
```

### PasswordlessChannelRegistry

Runtime registry for channel implementations.

```typescript
class PasswordlessChannelRegistry {
  register(channel: PasswordlessChannelPort): void;
  get(channelName: PasswordlessChannel): PasswordlessChannelPort;
}
```

## Usage Examples

### Issuing a Challenge

```typescript
import {
  IssuePasswordlessChallengeService,
  PasswordlessChannel,
  ChallengeDestination,
  ChallengeSecret,
} from '@rineex/authentication-method-passwordless';

const service = new IssuePasswordlessChallengeService(
  challengeRepository,
  idGenerator,
  clock,
);

const result = await service.execute({
  channel: PasswordlessChannel.create('email'),
  destination: ChallengeDestination.create('user@example.com'),
  secret: ChallengeSecret.create('123456'),
  ttlSeconds: '5m',
});

if (result.isOk()) {
  const challenge = result.value;
  // Deliver secret via channel
}
```

### Verifying a Challenge

```typescript
import {
  PasswordlessChallengeExpired,
  PasswordlessChallengeSecretMismatch,
} from '@rineex/authentication-method-passwordless';

const challenge = await repository.findById(challengeId);

try {
  challenge.verify(userProvidedCode);
  // Challenge verified - create session
  await repository.save(challenge);
} catch (error) {
  if (error instanceof PasswordlessChallengeExpired) {
    // Handle expired challenge
  }
  if (error instanceof PasswordlessChallengeSecretMismatch) {
    // Handle invalid code
  }
}
```

### Implementing a Channel

```typescript
import {
  PasswordlessChannelPort,
  PasswordlessChannel,
  ChallengeDestination,
  ChallengeSecret,
} from '@rineex/authentication-method-passwordless';

const emailChannel: PasswordlessChannelPort = {
  channelName: PasswordlessChannel.create('email'),
  deliver: async (
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ) => {
    await emailService.send({
      to: destination.value,
      subject: 'Your verification code',
      body: `Your code is: ${secret.value}`,
    });
  },
};

channelRegistry.register(emailChannel);
```

### Extending Channel Types (TypeScript)

```typescript
declare module '@rineex/authentication-method-passwordless' {
  interface PasswordlessChannelRegistry {
    readonly custom_channel: true;
  }
}
```

## Behavior & Guarantees

### Invariants

- A challenge cannot be verified after expiration
- A challenge can only be verified once (single-use)
- Secret comparison is timing-safe (prevents timing attacks)
- Expiration time must be after issuance time
- Channel and secret are required properties

### Security Characteristics

- Uses SHA-256 hashing with `crypto.timingSafeEqual` for secret comparison
- Secrets are never logged in domain events (only destination and channel)
- Challenges are single-use to prevent replay attacks

### Status State Machine

```
issued ──verify()──> verified (final)
   │
   └──expires──> expired (final)
```

## Operational Notes

### Configuration

| Parameter    | Default  | Description                                                               |
| ------------ | -------- | ------------------------------------------------------------------------- |
| `ttlSeconds` | `'300s'` | Challenge validity duration (accepts `ms` format: `'5m'`, `'300s'`, etc.) |

### Domain Error Codes

| Code                                       | Type                   | Description                |
| ------------------------------------------ | ---------------------- | -------------------------- |
| `AUTH_PASSWORDLESS.CHALLENGE_EXPIRED`      | `DOMAIN.INVALID_STATE` | Challenge has expired      |
| `AUTH_PASSWORDLESS.CHALLENGE_ALREADY_USED` | `DOMAIN.INVALID_STATE` | Challenge already verified |
| `AUTH_PASSWORDLESS.SECRET_MISMATCH`        | `DOMAIN.INVALID_VALUE` | Secret doesn't match       |
| `AUTH_PASSWORDLESS.CHANNEL_REQUIRED`       | `DOMAIN.INVALID_VALUE` | Missing channel            |
| `AUTH_PASSWORDLESS.SECRET_REQUIRED`        | `DOMAIN.INVALID_VALUE` | Missing secret             |
| `AUTH_PASSWORDLESS.INVALID_EXPIRATION`     | `DOMAIN.INVALID_VALUE` | Invalid expiration time    |

### Common Pitfalls

- **Not persisting after verification**: Always save the challenge after calling
  `verify()` to persist the status change
- **Reusing challenges**: Challenges are single-use; issue a new one for each
  authentication attempt
- **Missing channel implementation**: Register channel implementations before
  use via `PasswordlessChannelRegistry`
- **Clock skew**: Use consistent clock implementations across services to
  prevent premature expiration

### Dependencies

- `@rineex/auth-core`: Core authentication abstractions
- `@rineex/ddd`: Domain-driven design primitives (AggregateRoot, ValueObject,
  DomainEvent, Result)
- `ms`: Time string parsing

## License

Apache-2.0
