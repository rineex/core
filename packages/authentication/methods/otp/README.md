# @rineex/authentication-method-otp

An OTP implementation of the `@rineex/auth-core` authentication-method port.

```bash
pnpm add @rineex/authentication-method-otp @rineex/auth-core
```

The package exports `OtpAuthMethod` and `OtpChannelPort`. Its constructor also
requires an `OtpCode` generator, but `OtpCode` is not exported from the package
root. This revision therefore does not provide a complete supported consumer
integration; do not use a deep import to fill that gap.

See [Authentication](../../../../docs/authentication.md) for input requirements.
