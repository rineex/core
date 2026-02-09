# @rineex/auth-core

## 1.0.3

### Patch Changes

- Updated dependencies
  [[`68c324f`](https://github.com/rineex/core/commit/68c324f455ff43975eca0c20dfb13113b8afb4f0)]:
  - @rineex/ddd@3.1.1

## 1.0.2

### Patch Changes

- Updated dependencies
  [[`79c7154`](https://github.com/rineex/core/commit/79c7154c8b4cf1aa6804b45d54ca8e07aa1556b8)]:
  - @rineex/ddd@3.1.0

## 1.0.1

### Patch Changes

- Updated dependencies
  [[`70e28f9`](https://github.com/rineex/core/commit/70e28f9105891a1001f0c6efae27ca59470a9cf5)]:
  - @rineex/ddd@3.0.1

## 1.0.0

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

### Patch Changes

- Updated dependencies
  [[`4e77b3e`](https://github.com/rineex/core/commit/4e77b3e26ac827a30cf673ef6575fbbf0443ae3b)]:
  - @rineex/ddd@3.0.0

## 0.1.2

### Patch Changes

- Updated dependencies
  [[`5c8b81d`](https://github.com/rineex/core/commit/5c8b81d0d19f3bf1c8eae63c4a8594eb24b19bc1)]:
  - @rineex/ddd@2.2.0

## 0.1.1

### Patch Changes

- update package.json files to include files field for distribution
  ([`ec6ad7a`](https://github.com/rineex/core/commit/ec6ad7a70910ebb31d067eaaf3584cc2926acfc5))

- Updated dependencies []:
  - @rineex/ddd@2.1.0

## 0.1.0

### Minor Changes

- enhance TypeScript configuration and update package.json
  ([`5f08435`](https://github.com/rineex/core/commit/5f08435b20b7f9bc0448b345df64de1f436413f0))

### Patch Changes

- Updated dependencies
  [[`5f08435`](https://github.com/rineex/core/commit/5f08435b20b7f9bc0448b345df64de1f436413f0)]:
  - @rineex/ddd@2.1.0

## 0.0.6

### Patch Changes

- Updated dependencies
  [[`200f30a`](https://github.com/rineex/core/commit/200f30aa61b341774f93c8ce0910be0c53f5e7f2),
  [`54d43d0`](https://github.com/rineex/core/commit/54d43d0bda3d9ce13146eaaaf1b1aa21314823de)]:
  - @rineex/ddd@2.0.0

## 0.0.5

### Patch Changes

- Updated dependencies
  [[`94c732f`](https://github.com/rineex/core/commit/94c732fc529d269886216e63ac9d47605036fae4)]:
  - @rineex/ddd@1.6.1

## 0.0.4

### Patch Changes

- Updated dependencies
  [[`0fab4a2`](https://github.com/rineex/core/commit/0fab4a28f4b5b8af947f587448804115a2fd509c)]:
  - @rineex/ddd@1.6.0

## 0.0.3

### Patch Changes

- Updated dependencies
  [[`b1e8e3a`](https://github.com/rineex/core/commit/b1e8e3a4e02644118af82b8f068259d3e5bb2f24)]:
  - @rineex/ddd@1.5.2

## 0.0.2

### Patch Changes

- Updated dependencies
  [[`a347a2f`](https://github.com/rineex/core/commit/a347a2fbe9b1136c811f89a8ee4335bad13ca2ba)]:
  - @rineex/ddd@1.5.2

## 0.0.1

### Patch Changes

- add initial documentation and modular structure for auth-core package
  ([`bc6f1fc`](https://github.com/rineex/core/commit/bc6f1fce44cf9138ae417eb3463d1748b433d65c))
