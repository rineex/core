# Auth Core — Task Breakdown

Granular tasks derived from [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## Passwordless integration

- [ ] Export passwordless services, aggregate, and ports from `index.ts`
- [ ] Add `PasswordlessAuthMethod` class implementing `AuthMethodPort`
- [ ] Wire `PasswordlessAuthMethod` into `AuthenticationMethodResolver`
- [ ] Integration test: start attempt → passwordless start → verify → succeed

## Export hygiene

- [ ] Add export tier table to README
- [ ] Decide MFA subpath export vs main entry promotion
- [ ] Export `AuthCoreErrorRegistry` from package entry
- [ ] Resolve Identity entity vs aggregate naming collision

## OAuth

- [ ] Implement `OAuthAuthorizeService` with repository dependency
- [ ] Export OAuth authorization aggregate and value objects
- [ ] Add OAuth flow integration test (domain level)

## Error consistency

- [ ] Replace plain `Error` in `Token` aggregate with `EntityValidationError`
- [ ] Add domain error for invalid `OtpCode` in core VO
- [ ] Verify all error classes in architecture spec

## Channels

- [ ] Implement or remove `EmailChannel` stub
- [ ] Implement or remove `SMSChannelImp` stub
- [ ] Document channel adapter contract in passwordless README

## Documentation (completed in sync)

- [x] Rewrite Architecture.md, Definition.md, RULES.md
- [x] Update domain errors and value objects READMEs
- [x] Sync Result/DomainError patterns across packages
- [x] Preserve aspirational spec in FUTURE.md
