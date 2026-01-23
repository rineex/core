---
'@rineex/authentication-method-otp': patch
---

fix: update OTP error namespace from OTP to AUTH_OTP

- Update DomainErrorNamespaces to use AUTH_OTP namespace instead of OTP
- Update error code from OTP.AUTHENTICATION_FAILED to
  AUTH_OTP.AUTHENTICATION_FAILED
- Aligns with AUTH*CORE*\* naming convention used throughout the authentication
  core package
