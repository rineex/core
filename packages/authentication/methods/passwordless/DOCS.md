# Passwordless Authentication Method — Production Documentation

## 1. Overview

### What this component does

- Manages the lifecycle of passwordless authentication challenges (OTP, magic
  links, etc.) via a challenge–response flow.
- Exposes two application services: **issue** (create and persist a challenge)
  and **verify** (load, verify secret, persist state).
- Uses a channel-agnostic design: delivery (email, SMS, push, authenticator app)
  is implemented by adapters against the channel port.
- Emits domain events on challenge issuance and verification; uses timing-safe
  secret comparison.

### When to use

- Passwordless login (magic links, OTP).
- OTP-based MFA verification.
- Any flow that needs short-lived, single-use challenge verification without
  passwords.

### When not to use

- Password-based auth (use a dedicated auth method).
- Session or token lifecycle (this package only handles challenge issue/verify).
- Without implementing the required ports (repository, ID generator, clock for
  issue; repository for verify).

---

## 2. Public API

### Application services

| Service                              | Constructor                        | Purpose                                                                                                                     |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `IssuePasswordlessChallengeService`  | `(repository, idGenerator, clock)` | Creates a new challenge, persists it, returns `Result<Aggregate, Error>`.                                                   |
| `VerifyPasswordlessChallengeService` | `(repository)`                     | Loads challenge by ID, checks existence/expiry/secret, calls aggregate `verify`, saves, returns `Result<Aggregate, Error>`. |

#### IssuePasswordlessChallengeService.execute

- **Parameters:** `{ channel, destination, secret, ttlSeconds? }`
  - `channel`: `PasswordlessChannel` (e.g. `email`, `sms`, `authenticator_app`,
    `push`).
  - `destination`: `ChallengeDestination` (min 3 chars).
  - `secret`: `ChallengeSecret` (min 4 chars).
  - `ttlSeconds`: optional, `ms`-compatible string; default `'300s'`.
- **Returns:** `Promise<Result<PasswordlessChallengeAggregate, Error>>`.
- **Errors:** Any exception from aggregate creation or repository save is caught
  and returned as `Result.fail(error)`.

#### VerifyPasswordlessChallengeService.execute

- **Parameters:** `{ id: PasswordlessChallengeId, secret: ChallengeSecret }`.
- **Returns:** `Promise<Result<PasswordlessChallengeAggregate, Error>>`.
- **Success path:** Challenge found, not expired, secret matches → aggregate
  verified and saved → `Result.ok(challenge)`.
- **Failure modes (Result.fail):**
  - `PasswordlessChallengeNotFoundError` — `findById` returned `null`.
  - `PasswordlessChallengeExpiredError` — `challenge.isExpired()` is true.
  - `PasswordlessChallengeSecretMismatchError` —
    `challenge.matchesSecret(secret.value)` is false.
  - Any error thrown inside the `try` (e.g.
    `PasswordlessChallengeAlreadyUsedError` from `verify()`, or repository
    rejections) is returned as `Result.fail(error)`.

### Domain aggregate

- **PasswordlessChallengeAggregate**
  - **Static:** `issue({ id, createdAt?, props })` — creates aggregate, emits
    `PasswordlessChallengeIssuedEvent`.
  - **Instance:** `verify(secret, now?)`, `isExpired(now?)`,
    `matchesSecret(input)`, `toObject()`, `validate()`.
  - **verify()** throws: `PasswordlessChallengeExpiredError`,
    `PasswordlessChallengeAlreadyUsedError`,
    `PasswordlessChallengeSecretMismatchError`.

### Ports (implement these)

| Port                              | Contract                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `PasswordlessChallengeRepository` | `save(challenge): Promise<void>`; `findById(id: string): Promise<PasswordlessChallengeAggregate \| null>`. |
| `PasswordlessIdGeneratorPort`     | `generate(): PasswordlessChallengeId`.                                                                     |
| `ClockPort`                       | `now(): Date`.                                                                                             |
| `PasswordlessChannelPort`         | `channelName: PasswordlessChannel`; `deliver(destination, secret): Promise<void>`.                         |

### Registry

- **PasswordlessChannelRegistry**
  - **Static:** `init(channels: readonly PasswordlessChannelPort[])` — builds
    registry; throws if duplicate channel name.
  - **Instance:** `resolve(key: string): PasswordlessChannelPort` (throws if
    unknown); `supports(channel: PasswordlessChannel): boolean`.

### Value objects (factory / validation)

- `PasswordlessChannel.create(value)` —
  `'email' | 'sms' | 'authenticator_app' | 'push'`.
- `ChallengeDestination.create(value)` — min 3 chars.
- `ChallengeSecret.create(value)` — min 4 chars.
- `OtpCode.create(value)` — exactly 6 digits.
- `PasswordlessChallengeId.fromString(id)`.
- `PasswordlessChallengeStatus`: `issued()`, `verified()`, `expired()`.

### Domain events

- `PasswordlessChallengeIssuedEvent` — name
  `auth.passwordless.challenge_created`; payload includes `channel`,
  `destination`, `expiresAt`.
- `PasswordlessChallengeVerifiedEvent` — name
  `auth.passwordless.challenge_verified`; payload includes `channel`,
  `destination`, `verifiedAt`.

---

## 3. Usage examples

### Issue then verify (recommended: use services)

```typescript
const issueService = new IssuePasswordlessChallengeService(
  challengeRepository,
  idGenerator,
  clock,
);

const issueResult = await issueService.execute({
  channel: PasswordlessChannel.create('email'),
  destination: ChallengeDestination.create('user@example.com'),
  secret: ChallengeSecret.create('123456'),
  ttlSeconds: '5m',
});

if (issueResult.isFailure) return handle(issueResult.getError());
const challenge = issueResult.getValue();
// Deliver challenge.props.secret via channel; then later:

const verifyService = new VerifyPasswordlessChallengeService(
  challengeRepository,
);
const verifyResult = await verifyService.execute({
  id: challenge.id,
  secret: ChallengeSecret.create(userInputCode),
});

if (verifyResult.isSuccess) {
  const verified = verifyResult.getValue();
  // Create session or token from verified challenge.
}
```

### Repository contract

```typescript
const repository: PasswordlessChallengeRepository = {
  findById: id => db.findChallengeById(id),
  save: challenge => db.saveChallenge(challenge),
};
```

### Channel registry

```typescript
const registry = PasswordlessChannelRegistry.init([emailChannel, smsChannel]);
const channel = registry.resolve('email');
if (registry.supports(PasswordlessChannel.create('sms'))) {
  // use SMS
}
```

---

## 4. Behavior and guarantees

- **Invariants:** Expiration time is after issuance; challenge is single-use
  (verified or expired is final); secret comparison is timing-safe (e.g.
  SHA-256 + `crypto.timingSafeEqual`).
- **Idempotency:** Verify is not idempotent — second verify of the same
  challenge throws / returns error (already used or expired).
- **Ordering:** Issue before verify; persist after verify for state to be
  durable.
- **Concurrency:** No in-process locking; uniqueness and overwrites are the
  responsibility of the repository implementation.

---

## 5. Operational notes

- **Configuration:** Default TTL is `'300s'`; accept `ms`-style strings (e.g.
  `'5m'`, `'300s'`).
- **Observability:** Domain events are the hook for logging/metrics; no built-in
  logging in the services.
- **Pitfalls:**
  - Always persist after verify (service does this).
  - Do not reuse challenges; issue a new one per attempt.
  - Register channel implementations before use; use a single clock source to
    avoid skew and premature expiration.
