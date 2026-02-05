---
'@rineex/ddd': major
'@rineex/auth-core': major
'@rineex/authentication-method-otp': major
'@rineex/authentication-method-passwordless': minor
---

Passwordless architecture overhaul and error handling refactor

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
