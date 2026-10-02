# @rineex/authentication-method-otp

An OTP implementation of the `@rineex/auth-core` authentication-method port.

```bash
pnpm add @rineex/authentication-method-otp @rineex/auth-core
```

Construct `OtpAuthMethod` with an `OtpChannelPort` and an OTP generator. The
channel delivers and verifies `OtpCode` values for an `IdentityId`; it may be
backed by SMS, email, push, voice, or another transport. The package exports
`OtpAuthMethod` and `OtpChannelPort`.

See [Authentication](../../../../docs/authentication.md) for input requirements.
