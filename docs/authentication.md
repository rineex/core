# Authentication

Authentication packages separate core domain contracts from method
implementations. `@rineex/auth-core` is the supported public foundation; adapt
its repository, session, event-publisher, log, and authentication-method ports
in the application layer.

## Core public surface

`@rineex/auth-core` exports identity aggregates/entities/value objects and
lifecycle events, policy contracts and `AuthPolicyEngine`, inbound/outbound
ports, and authentication context/factor/method/policy/provider/risk types. It
does not export its application services, OAuth implementation, MFA
implementation, or infrastructure code from the package root.

This means consumers should compose the public domain contracts rather than
importing internal service paths.

## OTP method

`OtpAuthMethod` implements the core authentication-method port. Give it an
`OtpChannelPort` and an OTP generator. The channel is responsible for delivery
and verification; it can use SMS, email, push, voice, or another transport.

```ts
const method = new OtpAuthMethod(channel, () => OtpCode.create('123456'));
```

The `start` input must expose an `IdentityId` at `ctx.identityId` or
`ctx.metadata.identityId`. The `verify` payload must contain an `IdentityId` and
a string `code`.

## Passwordless method status

The passwordless package contains challenge aggregate, service, registry, port,
and channel source code, but its package entry point currently exports nothing.
It is therefore not a supported consumable API yet. Avoid deep imports until its
`src/index.ts` intentionally exports a public contract.
