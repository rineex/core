# Auth Core — Future Work Tracker

Gaps between the **current implementation** and a complete authentication
platform. Aspirational designs are preserved in [FUTURE.md](./FUTURE.md).

## Code Gaps (priority order)

| #   | Gap                                             | Impact                                                          |
| --- | ----------------------------------------------- | --------------------------------------------------------------- |
| 1   | Passwordless not on `AuthMethodPort`            | Two integration patterns; flow services cannot use passwordless |
| 2   | Passwordless `index.ts` exports nothing         | README API not importable from package entry                    |
| 3   | MFA/OAuth/session/token domains unexported      | Consumers cannot use in-tree models without deep imports        |
| 4   | `OAuthAuthorizeService` is a stub               | OAuth flow incomplete at application layer                      |
| 5   | Email/SMS channel stubs throw `not implemented` | Passwordless delivery not wired                                 |
| 6   | Two `Identity` types (entity vs aggregate)      | Naming collision confuses contributors                          |
| 7   | `Token` aggregate throws plain `Error`          | Inconsistent with registry-backed `DomainError` pattern         |
| 8   | `OtpCode` in core throws generic `Error`        | Should use domain error class                                   |

## Documentation Gaps (addressed in this sync)

- Design docs described Principal/Credential/Flow DSL — rewritten to match code
- Auth errors README documented removed `type` field — updated for v6 registry
- Passwordless docs used `Result.fail` / `getValue()` — updated to v5 API
- Root README had broken ddd anchors and wrong project tree — fixed

## Integration Gaps

| Desired flow                              | Blocker                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| End-to-end OTP login via flow services    | Needs consumer adapters for repos + `OtpChannelPort` |
| End-to-end passwordless via flow services | Needs `PasswordlessAuthMethod` adapter               |
| MFA step-up after policy deny             | MFA services exist but are unexported                |
| OAuth authorization code flow             | Domain exists; app service incomplete                |

## Export Tiers (proposed)

| Tier         | Contents                       |
| ------------ | ------------------------------ |
| Stable       | Current `index.ts` exports     |
| Experimental | MFA, OAuth subpath exports     |
| Internal     | Everything else until promoted |

## Related

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — actionable tasks
- [ROADMAP.md](./ROADMAP.md) — phased timeline
- [FUTURE.md](./FUTURE.md) — original aspirational specification
