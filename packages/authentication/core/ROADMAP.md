# Auth Core — Roadmap

Phased plan from current state. Timelines are indicative.

## Phase 1 — Integration consistency (current focus)

- Export passwordless runtime API from package entry
- Add `PasswordlessAuthMethod` implementing `AuthMethodPort`
- Wire passwordless into flow orchestration services
- Implement email/SMS channel adapters (or document consumer responsibility)

## Phase 2 — Publish in-tree domains

- Export MFA session domain + services (or subpath `@rineex/auth-core/mfa`)
- Complete `OAuthAuthorizeService` and export OAuth domain
- Export session and token domains with clear stability tiers
- Resolve `Identity` entity vs aggregate naming

## Phase 3 — Policy and risk

- Expand `AuthPolicyRegistry` beyond `base`
- Populate `RiskSignalRegistry` and wire evaluators
- Step-up MFA flow end-to-end through policy engine

## Phase 4 — Platform features (from FUTURE.md)

- Flow DSL (data-driven authentication flows)
- Credential lifecycle
- Trust levels on sessions
- Additional methods: password, passkeys, social, API tokens

## Completed (documentation sync)

- Rewrote Architecture, Definition, RULES to match implementation
- Synced docs with `@rineex/ddd` v5/v6 (Result union, registry errors)
- Created FUTURE.md preserving aspirational design

See [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) for detailed gap list.
