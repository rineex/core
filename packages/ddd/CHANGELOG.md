# @rineex/ddd

## 3.0.1

### Patch Changes

- Rewrite README to reflect current implementation. Remove deprecated UUID
  references, add OAuthAuthorization-style Entity example, use AggregateId
  throughout.
  ([`70e28f9`](https://github.com/rineex/core/commit/70e28f9105891a1001f0c6efae27ca59470a9cf5))

## 3.0.0

### Major Changes

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

## 2.2.0

### Minor Changes

- improvements
  ([`5c8b81d`](https://github.com/rineex/core/commit/5c8b81d0d19f3bf1c8eae63c4a8594eb24b19bc1))

## 2.1.0

### Minor Changes

- enhance TypeScript configuration and update package.json
  ([`5f08435`](https://github.com/rineex/core/commit/5f08435b20b7f9bc0448b345df64de1f436413f0))

## 2.0.0

### Major Changes

- Added type guard methods `isSuccessResult()` and `isFailureResult()` to Result
  ([`54d43d0`](https://github.com/rineex/core/commit/54d43d0bda3d9ce13146eaaaf1b1aa21314823de))
  class for improved TypeScript type narrowing. Updated Result class
  documentation, comprehensive unit tests, and README with usage examples and
  best practices.

  **New Methods:**
  - `Result.isSuccessResult(): this is Result<T, never>` - Type guard for
    success results
  - `Result.isFailureResult(): this is Result<never, E>` - Type guard for
    failure results

  **Breaking Changes:** None - these are additive changes that enhance type
  safety without breaking existing code.

### Patch Changes

- Enhanced Result class with comprehensive JSDoc documentation, added unit
  tests,
  ([`200f30a`](https://github.com/rineex/core/commit/200f30aa61b341774f93c8ce0910be0c53f5e7f2))
  and updated README with usage examples and best practices.

## 1.6.1

### Patch Changes

- Update README to reflect actual code structure and API
  ([`94c732f`](https://github.com/rineex/core/commit/94c732fc529d269886216e63ac9d47605036fae4))

## 1.6.0

### Minor Changes

- add changelog entry for minor updates
  ([`0fab4a2`](https://github.com/rineex/core/commit/0fab4a28f4b5b8af947f587448804115a2fd509c))

## 1.5.2

### Patch Changes

- docs: add documentation for result class
  ([`b1e8e3a`](https://github.com/rineex/core/commit/b1e8e3a4e02644118af82b8f068259d3e5bb2f24))

## 1.5.2

### Patch Changes

- just for fixing
  ([`a347a2f`](https://github.com/rineex/core/commit/a347a2fbe9b1136c811f89a8ee4335bad13ca2ba))

## 1.5.1

### Patch Changes

- export id value object from domain value-objects
  ([`7f14ba6`](https://github.com/rineex/core/commit/7f14ba69676736a3b1fad984bdc7fcce3ead6640))

## 1.5.0

### Minor Changes

- simplify constructor and enhance equals method + add updaterProps method
  ([`5712749`](https://github.com/rineex/core/commit/57127499a69535417d07d38024df21d0a43ef36a))

## 1.4.0

### Minor Changes

- export primitive value object from domain base
  ([`fd88fb5`](https://github.com/rineex/core/commit/fd88fb5ce50fb9198c6a00bb67a470da4c45fc5b))

## 1.3.0

### Minor Changes

- implement UUID and AggregateId value objects with validation and serialization
  ([`283c3a9`](https://github.com/rineex/core/commit/283c3a9aa8210a780f90c1b69e2d0b8f2cbc090a))

### Patch Changes

- fix: update Node setup to use version from package.json
  ([#6](https://github.com/rineex/core/pull/6))

## 1.2.0

### Minor Changes

- feat: implement UserAgentFactory and update UserAgent for better metadata
  ([`9519aa9`](https://github.com/rineex/core/commit/9519aa9d281e7242e3bd3500c43299569c454725))
  handling

## 1.1.1

### Patch Changes

- documentation for `@rineex/ddd` added
  ([`59c548c`](https://github.com/rineex/core/commit/59c548c5bba66be101bd532e62afd49e383b9af7))

## 1.1.0

### Minor Changes

- aggregate root + base entity + domain events added
  ([`9e56fdf`](https://github.com/rineex/core/commit/9e56fdfdfbbad16825170385ec324ef0867b3b7a))

## 1.0.0

### Major Changes

- init second time
  ([`e0c3105`](https://github.com/rineex/core/commit/e0c3105006386ea458d6f795618fe9180796a4e5))

## 0.1.0

### Minor Changes

- init
