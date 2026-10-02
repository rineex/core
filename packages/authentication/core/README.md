# @rineex/auth-core

Framework-independent authentication domain contracts. The package exports
identity aggregates/entities/value objects/events, policy contracts and engine,
inbound/outbound ports, and authentication types.

```bash
pnpm add @rineex/auth-core @rineex/ddd
```

Compose exported ports with application-specific repositories, session storage,
event publication, and method implementations. Internal application services,
OAuth/MFA code, and infrastructure are not public package exports.

See [Authentication](../../../docs/authentication.md) for integration
boundaries.
