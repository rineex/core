# API reference

This reference inventories the supported package-root API. Names are grouped by
responsibility so readers can navigate the source without treating internal file
paths as public contracts.

## `@rineex/ddd`

| Area                  | Public API                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base modeling         | `ValueObject`, `PrimitiveValueObject`, `Entity`, `AggregateRoot`, `DomainEvent`                                                                                                         |
| IDs and value objects | `AggregateId`, `DomainID`, `Email`, `IPAddress`, `Timestamp`, `Url`, `UserAgent`, `UserAgentProps`                                                                                      |
| Errors and outcomes   | `DomainError`, `Result`, `Ok`, `Err`, `UseCaseError`, core error registry/types, internal/invalid-state/invalid-value/timeout errors, entity-validation and invalid-value-object errors |
| Types                 | deep primitive/immutable, entity brand/ID, mapper, and value-object-like types                                                                                                          |
| Services and mapping  | application-service and logger ports, clock port, `BaseMapper`                                                                                                                          |
| Utilities             | `deepFreeze`, HTTP status constants                                                                                                                                                     |

`Result` is a discriminated union with `kind: 'ok' | 'err'`. Use `Result.ok`,
`Result.err`, `Result.void`, `Result.match`, `Result.map`, `Result.mapError`,
`Result.flatMap`, `Result.isOk`, `Result.isErr`, and `Result.isResult`.

## `@rineex/decision-engine`

| Area                 | Public API                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Execution            | `DecisionEngine`, `DecisionValidator`, `DefaultDecisionValidator`                                                                                                                                                                                                 |
| Definition and input | `DecisionDefinition`, `DecisionRequest`, `DecisionPolicy`, `DecisionContext`, `CandidateRefResolver`                                                                                                                                                              |
| Pipeline records     | `CandidateEvaluation`, `DecisionResult`, `DecisionExecution`, `DecisionEvent`                                                                                                                                                                                     |
| Constraints/features | `Constraint`, `ConstraintResult`, `Feature`, `FeatureValue`, `FeatureObjective`                                                                                                                                                                                   |
| Strategies           | `Normalizer`, `MinMaxNormalizer`, `ScoringStrategy`, `WeightedSumScoringStrategy`, `FeatureWeightResolver`, `RankingStrategy`, `DescendingScoreRankingStrategy`, `SelectionStrategy`, `SelectFirstStrategy`, `SelectTopNStrategy`, `SelectAboveThresholdStrategy` |
| Events/publication   | `CandidateRejectedEvent`, `DecisionCompletedEvent`, `DecisionEventPublisher`, `DecisionEventHandler`, `InMemoryDecisionEventPublisher`                                                                                                                            |
| Errors               | `DecisionError`, `DecisionExecutionError`, `InvalidDecisionDefinitionError`                                                                                                                                                                                       |

Use only an implementation of the exported strategy contracts. The engine
validates collaborator outputs, so custom strategies must preserve the
configured candidate/feature semantics described in the
[decision guide](decision-engine.md).

## `@rineex/auth-core`

The root groups exports into `domain`, `ports`, and `types`.

- **Identity domain:** identity and authentication-attempt aggregates; identity
  entity; identity, auth-attempt, factor, method, policy, provider, and status
  value objects; authentication started/failed/succeeded and identity
  created/disabled events.
- **Policy domain:** `AuthPolicyEvaluator`, `AuthPolicyEngine`,
  `AuthPolicyContext`, and `AuthPolicyDecision`.
- **Inbound port:** `AuthMethodPort` and `AuthMethodOutcome`.
- **Outbound ports:** identity, authentication-attempt, session, token, and
  OAuth-authorization repositories; session, identity, and domain-event
  publisher adapters; logging, MFA, and observability ports.
- **Types:** `AuthContext`, `AuthFactor`, `AuthMethod`, `AuthPolicy`,
  `IdentityProvider`, `RiskSignal`, and observability event types.

Only exports re-exported by those three root barrels are supported. In
particular, service classes and OAuth/MFA implementation files are not public
root API.

## Authentication method packages

`@rineex/authentication-method-otp` exports `OtpAuthMethod` and
`OtpChannelPort`. Its current constructor type depends on an internal,
non-root-exported `OtpCode`, so do not treat it as a complete constructible
public integration yet.

`@rineex/authentication-method-passwordless` exports nothing from its root. Its
implementation is intentionally not documented as a stable API.

## NestJS adapters

| Package               | Public API                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@rineex/ioredis`     | `RedisModule`, `RedisModuleAsyncOptions`, single/cluster/module option types, `InjectRedis`, `getRedisConnectionToken`, `getRedisOptionsToken`, `createRedisConnection`, `RedisHealthModule`, `RedisHealthIndicator` |
| `@rineex/pg-slonik`   | `SlonikModule`, `InjectPool`, configurable-module exports (`MODULE_OPTIONS_TOKEN`, `OPTIONS_TYPE`, `ASYNC_OPTIONS_TYPE`), `createSlonikToken`                                                                        |
| Cookie parser module  | `CookieParserModule`, `CookieParserMiddleware`, `CookieParseOptions`                                                                                                                                                 |
| CORS module           | `CorsModule`, `CorsMiddleware`, its configurable-module exports                                                                                                                                                      |
| Helmet module         | `HelmetModule`, `HelmetMiddleware`                                                                                                                                                                                   |
| Favicon-ignore module | `IgnoreFaviconModule`, `IgnoreFaviconMiddleware`                                                                                                                                                                     |
| Response-time module  | `ResponseTimeModule`, `ResponseTimeMiddleware`, `ResponseTimeOptions`                                                                                                                                                |

Nest configurable modules expose generated registration APIs. Use their
documented `register`/`registerAsync` calls rather than manually constructing
module providers.

## Configuration and reserved packages

`@rineex/eslint-config` publishes the `base`, `next-js`, `react-internal`, and
`db` configuration entry points. `@rineex/typescript-config` supplies
`base.json` and `react-library.json`. `@rineex/libs` currently exports no API.
