# Authentication

The authentication packages separate core domain contracts from method
implementations. `@rineex/auth-core` is the stable public foundation.
Applications provide persistence, session, event-publishing, logging, and
transport adapters through its exported ports.

## Install

```bash
pnpm add @rineex/auth-core @rineex/ddd
pnpm add @rineex/authentication-method-otp
```

## Core public API

`@rineex/auth-core` exports identity aggregates/entities/value objects and
lifecycle events; policy contracts and `AuthPolicyEngine`; inbound and outbound
ports; and auth context, factor, method, policy, provider, and risk types. Its
root entry point does **not** export application services, MFA/OAuth
implementation files, repositories, or infrastructure adapters. Treat those
source files as internal.

The public `AuthMethodPort` is the plugin boundary:

```ts
type AuthMethodPort = {
  readonly method: AuthMethodName;
  start(params: {
    authAttemptId: AuthAttemptId;
    ctx: unknown;
  }): AuthMethodOutcome | Promise<AuthMethodOutcome>;
  verify(params: {
    authAttemptId: AuthAttemptId;
    payload: unknown;
  }): AuthMethodOutcome | Promise<AuthMethodOutcome>;
};
```

An outcome is `{ ok: true }` or `{ ok: false, violation: UseCaseError }`. An
authentication method should validate the transport-shaped `ctx`/`payload`,
translate it to domain values, and return a violation for expected invalid input
rather than leaking transport concerns into the core domain.

## Implement persistence and event ports

The core exports ports for identity, authentication-attempt, session, and
OAuth-authorization persistence, session/token lookup, event publication,
logging, MFA time/ID/repository support, and observability events. Implement
them in the application infrastructure layer.

```ts
import type { IdentityRepository } from '@rineex/auth-core';

class PostgresIdentityRepository implements IdentityRepository {
  async get(id: IdentityId): Promise<Identity | null> {
    // Load persistence data and map it to Identity.
    return null;
  }

  async save(identity: Identity): Promise<void> {
    // Persist identity state and its pulled domain events atomically.
  }
}
```

Repositories operate on domain types, never on request/response DTOs. Publish
aggregate events through `DomainEventPublisherPort` after the persistence
transaction succeeds.

## Authentication policy

`AuthPolicyEvaluator` evaluates immutable facts in an `AuthPolicyContext`.
Return `null` for no opinion, a deny decision for a hard block, or an allow
decision that may require step-up authentication. `AuthPolicyEngine` evaluates
policies in order; the first hard deny wins and any allow decision can set
`requiresStepUp`.

```ts
import {
  AuthPolicyEngine,
  AuthPolicyEvaluator,
  type AuthPolicyContext,
} from '@rineex/auth-core';

class RiskPolicy extends AuthPolicyEvaluator {
  evaluate(context: AuthPolicyContext) {
    if (context.isBlocked)
      return { allowed: false as const, reason: 'IDENTITY_BLOCKED' };
    if ((context.riskScore ?? 0) >= 70)
      return { allowed: true as const, requiresStepUp: true };
    return null;
  }
}

const decision = new AuthPolicyEngine([new RiskPolicy()]).evaluate({
  method: AuthMethod.create('otp'),
  riskScore: 80,
});
```

Policies are pure decision logic. Risk scoring, device reputation, IP
intelligence, and other external facts must be calculated upstream and supplied
in the context.

## OTP method status and contract

`OtpAuthMethod` and `OtpChannelPort` are exported from
`@rineex/authentication-method-otp`. The port sends and verifies an internal
`OtpCode` for an `IdentityId`; `start` reads an identity from `ctx.identityId`
or `ctx.metadata.identityId`, while `verify` requires
`{ identityId: IdentityId, code: string }`. Invalid context, malformed payloads,
invalid code values, and failed channel verification return
`{ ok: false, violation }`.

> [!WARNING] The exported `OtpAuthMethod` constructor requires a generator
> returning `OtpCode`, but `OtpCode` itself is not exported from the package
> root. A consumer cannot construct that generator solely through the supported
> public API. Avoid deep imports: this package needs a public `OtpCode` export
> or a public generator abstraction before it is a complete supported
> integration surface.

When that boundary is made public, the channel should own transmission, storage,
retry policy, rate limiting, and provider failures; the method should own only
authentication-method orchestration.

## Passwordless package status

`@rineex/authentication-method-passwordless` contains passwordless challenge
aggregates, value objects, services, channel registries, repository/channel/ID
ports, and email/SMS channel implementations. Its current package root imports
only a declaration file and exports no runtime or type API. Do not deep-import
those files from an application; there is no compatibility contract until a
deliberate public entry point is added.
