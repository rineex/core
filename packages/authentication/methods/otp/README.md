# @rineex/authentication-method-otp

OTP authentication method for the Rineex auth system. Implements
`AuthMethodPort` from `@rineex/auth-core` and delegates delivery/verification to
`OtpChannelPort`.

## Installation

```bash
pnpm add @rineex/authentication-method-otp @rineex/auth-core @rineex/ddd
```

## Public API

| Export           | Description                     |
| ---------------- | ------------------------------- |
| `OtpAuthMethod`  | `AuthMethodPort` implementation |
| `OtpChannelPort` | Delivery and verification seam  |

## Usage

```typescript
import {
  OtpAuthMethod,
  OtpChannelPort,
} from '@rineex/authentication-method-otp';
import { OtpCode } from './otp-code'; // internal VO; provide generator

const channel: OtpChannelPort = {
  async sendOtp(identityId, otp) {
    // deliver via SMS, email, etc.
  },
  async verifyOtp(identityId, otp) {
    return true;
  },
};

const otpMethod = new OtpAuthMethod(channel, () => OtpCode.generate());

// Register with flow orchestration at composition root
const outcome = await otpMethod.start({
  authAttemptId,
  ctx: { identityId: identityId.value },
});
```

## AuthMethodPort contract

- `start` — generates OTP via `otpGenerator`, sends via `OtpChannelPort`
- `verify` — parses payload, verifies via `OtpChannelPort`

Returns `AuthMethodOutcome`: `{ ok: true }` or `{ ok: false, violation }`.

This is **not** `Result<T>` — the application layer wraps outcomes as needed.

## Error registry

```typescript
export const OtpErrorRegistry = {
  AUTH_OTP: ['AUTHENTICATION_FAILED'],
} as const;
```

`OtpAuthenticationError` uses code `AUTH_OTP.AUTHENTICATION_FAILED`.

## Integration with auth-core

1. Implement `OtpChannelPort` in your infrastructure layer
2. Instantiate `OtpAuthMethod` with channel + generator
3. Register with `AuthenticationMethodResolver` (consumer wiring)
4. Wire `AuthenticationAttemptRepositoryPort` and flow services

## Development

```bash
cd packages/authentication/methods/otp
pnpm test
pnpm lint
pnpm check-types
```

## Related

- [@rineex/auth-core](../../core/README.md)
- [Passwordless method](../passwordless/README.md) — standalone challenge flow

## License

Apache-2.0
