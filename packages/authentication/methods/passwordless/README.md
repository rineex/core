# @rineex/authentication-method-passwordless

Passwordless challenge domain and application code built on `@rineex/auth-core`
and `@rineex/ddd`.

```bash
pnpm add @rineex/authentication-method-passwordless
```

At this revision, the package entry point exports no runtime or type API. Its
challenge aggregate, services, registries, ports, and email/SMS channels are
internal source modules. Avoid deep imports until a public entry point is
intentionally defined.

See [Authentication](../../../../docs/authentication.md) for the supported
boundary.
