# Auth Core — Implementation Plan

Open work items only. Completed fiction removed.

## 1. Passwordless integration

1. Export `IssuePasswordlessChallengeService`,
   `VerifyPasswordlessChallengeService`, aggregate, and ports from
   `methods/passwordless/src/index.ts`
2. Create `PasswordlessAuthMethod` implementing `AuthMethodPort`
3. Register in flow services alongside `OtpAuthMethod`
4. Add integration tests for attempt → passwordless → succeed path

## 2. Export hygiene

1. Document export tiers in README (stable / experimental / internal)
2. Add subpath exports for MFA and OAuth OR promote to main entry
3. Export `AuthCoreErrorRegistry` and error classes for consumer handling
4. Rename or remove duplicate `Identity` aggregate

## 3. OAuth completion

1. Implement `OAuthAuthorizeService.execute` with repository port
2. Export OAuth domain types and ports
3. Add OAuth method package or extend core adapter

## 4. Error consistency

1. Migrate `Token` aggregate to `EntityValidationError` / registry errors
2. Migrate `OtpCode` validation to domain error class
3. Ensure all new errors pass `auth-core-error.architecture.spec.ts`

## 5. Channel implementations

1. Replace `EmailChannel` / `SMSChannelImp` stubs with real adapters or remove
2. Document consumer responsibility for channel delivery

## Out of scope (see FUTURE.md)

- Flow DSL compiler
- Principal/Credential aggregates
- Trust level model
- Package split into core-domain / core-ports

## Testing approach

- Architecture tests for error registry coverage (existing pattern)
- Application service tests with port mocks (see passwordless package)
- No tests for documentation-only changes

See [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md) for issue-sized slices.
