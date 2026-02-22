# @rineex/authentication-method-passwordless

## 0.1.8

### Patch Changes

- Updated dependencies
  [[`8288b06`](https://github.com/rineex/core/commit/8288b066870c3773a5591d83a74cfac7ea5392f5),
  [`0c695b9`](https://github.com/rineex/core/commit/0c695b900bacb976aa3dabd053b4315f3d8bbfe3)]:
  - @rineex/ddd@4.0.0
  - @rineex/auth-core@1.0.8

## 0.1.7

### Patch Changes

- Updated dependencies
  [[`69dc686`](https://github.com/rineex/core/commit/69dc68606545d612da8dc3eb890b996a520be117)]:
  - @rineex/ddd@3.2.2
  - @rineex/auth-core@1.0.7

## 0.1.6

### Patch Changes

- Updated dependencies
  [[`3efe26f`](https://github.com/rineex/core/commit/3efe26f54152966d7a2e19fec5e25f2f4048c235)]:
  - @rineex/ddd@3.2.1
  - @rineex/auth-core@1.0.6

## 0.1.5

### Patch Changes

- Updated dependencies
  [[`bfd5666`](https://github.com/rineex/core/commit/bfd5666f356aa71376968cfdb5b3d5c26f0c003c)]:
  - @rineex/ddd@3.2.0
  - @rineex/auth-core@1.0.5

## 0.1.4

### Patch Changes

- Updated dependencies
  [[`a58f863`](https://github.com/rineex/core/commit/a58f8637039bcd2d00f2526db9434ea6f82ceee0)]:
  - @rineex/ddd@3.1.2
  - @rineex/auth-core@1.0.4

## 0.1.3

### Patch Changes

- Updated dependencies
  [[`68c324f`](https://github.com/rineex/core/commit/68c324f455ff43975eca0c20dfb13113b8afb4f0)]:
  - @rineex/ddd@3.1.1
  - @rineex/auth-core@1.0.3

## 0.1.2

### Patch Changes

- Updated dependencies
  [[`79c7154`](https://github.com/rineex/core/commit/79c7154c8b4cf1aa6804b45d54ca8e07aa1556b8)]:
  - @rineex/ddd@3.1.0
  - @rineex/auth-core@1.0.2

## 0.1.1

### Patch Changes

- Updated dependencies
  [[`70e28f9`](https://github.com/rineex/core/commit/70e28f9105891a1001f0c6efae27ca59470a9cf5)]:
  - @rineex/ddd@3.0.1
  - @rineex/auth-core@1.0.1

## 0.1.0

### Minor Changes

- Passwordless architecture overhaul and error handling refactor
  ([`4e77b3e`](https://github.com/rineex/core/commit/4e77b3e26ac827a30cf673ef6575fbbf0443ae3b))

  **@rineex/ddd**
  - Replace violations with domain errors (InternalError, InvalidStateError,
    InvalidValueError, TimeoutError)
  - Add Clock port export

  **@rineex/auth-core**
  - Refactor auth flow: split AuthOrchestrator into StartAuthenticationFlow and
    VerifyAuthenticationFlow services
  - Add AuthMethodRegistry for pluggable authentication methods
  - Replace violations with domain errors (InvalidAuthToken, InvalidSession,
    InvalidScope)
  - Add authentication method resolver and new identity/aggregate support

  **@rineex/authentication-method-otp**
  - Replace OTP violations with OtpAuthenticationError

  **@rineex/authentication-method-passwordless**
  - Add PasswordlessChannelRegistry for pluggable channels (email, SMS)
  - Add verify-passwordless-challenge service; remove issue-passwordless-session
  - Add PasswordlessChannelApplicationError and domain error handling
  - Add barrel exports for application, domain, and infrastructure
  - Add DOCS.md, README improvements, and comprehensive test coverage
  - Add infrastructure channel tests for email and SMS

### Patch Changes

- Updated dependencies
  [[`4e77b3e`](https://github.com/rineex/core/commit/4e77b3e26ac827a30cf673ef6575fbbf0443ae3b)]:
  - @rineex/ddd@3.0.0
  - @rineex/auth-core@1.0.0

## 0.0.1

### Patch Changes

- Replace passwordless-session-created event with challenge-verified event. This
  ([#33](https://github.com/rineex/core/pull/33)) refactoring improves domain
  model accuracy by emitting challenge-verified events when challenges are
  verified, rather than session-created events.
