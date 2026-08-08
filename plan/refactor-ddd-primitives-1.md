---
goal: Harden DDD entities, aggregate roots, and domain events
version: 1.0
date_created: 2026-08-08
last_updated: 2026-08-08
owner: Rineex Team
status: Completed
tags: [refactor, ddd, architecture, breaking-change]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Refactor `@rineex/ddd` to enforce safe invariant validation, atomic entity
mutation, aggregate-owned event recording, explicit event metadata, and
mapper-based rehydration. Migrate all in-repository consumers to the new
contract.

## 1. Requirements & Constraints

- **REQ-001**: `Entity` must not invoke overridable subclass validation from its
  base constructor.
- **REQ-002**: Entity mutation must validate candidate state before committing
  it; failed mutation must preserve the previous state.
- **REQ-003**: Entity metadata and exposed state must not permit mutation
  through `Date` methods or mutable references.
- **REQ-004**: Concrete entity and aggregate creation/rehydration paths must
  validate explicitly.
- **REQ-005**: Aggregate event recording must be protected and reject events
  whose aggregate ID differs from the root ID.
- **REQ-006**: Domain events must require explicit ID, stable name, positive
  schema version, valid occurrence timestamp, and immutable JSON-safe payload.
- **REQ-007**: The domain event base class must not depend on `node:crypto`.
- **REQ-008**: Rehydration through mappers must not emit creation events.
- **REQ-009**: Update package documentation, migration guidance, tests, and all
  in-repository consumers.
- **CON-001**: The change is intentionally breaking; no deprecated compatibility
  aliases are required.
- **CON-002**: Preserve dependency direction: infrastructure and application
  depend on domain, never the reverse.
- **CON-003**: Keep public API names and examples internally consistent after
  migration.
- **PAT-001**: Domain methods express business intent; controllers,
  repositories, and event buses remain outside aggregates.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Define safe entity state and validation contracts.

| Task     | Description                                                                                                                                                                                                                                                                                   | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Update `packages/ddd/src/domain/entities/entity.ts`: remove constructor-time virtual validation; introduce candidate-props validation; make `mutate` validate before assignment; protect metadata/state snapshots from mutable `Date` references; preserve identity equality and JSON typing. |           |      |
| TASK-002 | Update `packages/ddd/src/domain/types/deep-immutable.type.ts` and related utilities/types so the compile-time immutability contract matches runtime behavior for dates, arrays, maps, sets, and nested values.                                                                                |           |      |
| TASK-003 | Update entity and type tests under `packages/ddd/src/domain/entities/__tests__/` and `packages/ddd/src/domain/types/__tests__/` for explicit construction validation, rollback after failed mutation, and date immutability.                                                                  |           |      |

### Implementation Phase 2

- GOAL-002: Harden aggregate boundaries and event collection.

| Task     | Description                                                                                                                                                                                                   | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-004 | Update `packages/ddd/src/domain/aggregates/aggregate-root.ts`: make event recording protected, verify aggregate identity, preserve ordered pull semantics, and document the application publication boundary. |           |      |
| TASK-005 | Update `packages/ddd/src/domain/aggregates/__tests__/aggregate-root.spec.ts` for protected recording through a test aggregate, mismatched aggregate IDs, event ordering, and pull behavior.                   |           |      |
| TASK-006 | Update all aggregate implementations in `packages/authentication/**/src/domain/**` to validate after construction and replace public `addEvent` calls with the new protected recording API.                   |           |      |

### Implementation Phase 3

- GOAL-003: Make domain events explicit, portable, and immutable.

| Task     | Description                                                                                                                                                                                 | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-007 | Update `packages/ddd/src/domain/events/domain.event.ts`: remove `node:crypto`, require event ID and occurrence metadata, validate event metadata, and return detached JSON-safe primitives. |           |      |
| TASK-008 | Migrate event classes and factories under `packages/authentication/**/src/domain/events/` and their tests to provide explicit event IDs/timestamps and stable versioned payloads.           |           |      |
| TASK-009 | Expand `packages/ddd/src/domain/events/__tests__/domain.event.spec.ts` for invalid metadata, nested payload immutability, detached serialization, and runtime portability assumptions.      |           |      |

### Implementation Phase 4

- GOAL-004: Complete mapper/documentation migration and verification.

| Task     | Description                                                                                                                                                                                       | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-010 | Update `packages/ddd/src/infrastructure/mapper/base.mapper.ts`, mapper types, and consumer mappers to expose explicit rehydration intent without emitting creation events.                        |           |      |
| TASK-011 | Reconcile `packages/ddd/README.md`, `packages/ddd/docs/DDD-GUIDE.md`, and `packages/ddd/docs/MIGRATION.md` with the final API and add minimal creation, command, event, and rehydration examples. |           |      |
| TASK-012 | Run `pnpm --filter @rineex/ddd check-types`, `test`, `lint`, and `build`; run affected authentication type/tests; fix all failures caused by the migration.                                       |           |      |

## 3. Alternatives

- **ALT-001**: Preserve constructor-time `validate()` for source compatibility.
  Rejected because it invokes overridable behavior before subclass
  initialization.
- **ALT-002**: Keep public `addEvent()` and trust callers. Rejected because it
  allows bypassing aggregate ownership and event invariants.
- **ALT-003**: Keep `node:crypto` event-ID generation. Rejected because it
  couples a domain abstraction to one runtime and hides event identity creation.
- **ALT-004**: Use event sourcing or CQRS as part of this refactor. Rejected as
  unnecessary complexity; this change only hardens tactical DDD primitives.

## 4. Dependencies

- **DEP-001**: TypeScript 5.9 and existing package type definitions.
- **DEP-002**: Existing value-object ID implementations satisfying `EntityId`.
- **DEP-003**: Existing authentication event factories and aggregate
  implementations.
- **DEP-004**: Existing Vitest, tsd, ESLint, and tsup verification commands.

## 5. Files

- **FILE-001**: `packages/ddd/src/domain/entities/entity.ts`
- **FILE-002**: `packages/ddd/src/domain/aggregates/aggregate-root.ts`
- **FILE-003**: `packages/ddd/src/domain/events/domain.event.ts`
- **FILE-004**: `packages/ddd/src/domain/types/deep-immutable.type.ts` and
  related type tests
- **FILE-005**: DDD unit/type tests under
  `packages/ddd/src/domain/**/__tests__/`
- **FILE-006**: Authentication aggregate/event consumers under
  `packages/authentication/**/src/domain/**`
- **FILE-007**: Mapper abstractions under
  `packages/ddd/src/infrastructure/mapper/` and
  `packages/ddd/src/domain/types/mapper.type.ts`
- **FILE-008**: `packages/ddd/README.md`, `packages/ddd/docs/DDD-GUIDE.md`,
  `packages/ddd/docs/MIGRATION.md`

## 6. Testing

- **TEST-001**: Constructing an invalid concrete entity throws only after the
  concrete constructor explicitly validates.
- **TEST-002**: A failed mutation leaves all prior entity props unchanged.
- **TEST-003**: Entity dates cannot be changed through `setTime` or returned
  mutable references.
- **TEST-004**: An aggregate cannot record an event for another aggregate.
- **TEST-005**: Event collection preserves order and pull clears only returned
  events.
- **TEST-006**: Invalid event IDs, names, versions, timestamps, and payloads are
  rejected.
- **TEST-007**: Nested event payloads cannot be mutated after construction and
  serialized output is detached.
- **TEST-008**: Creation emits creation events only when intended; mapper
  rehydration emits none.
- **TEST-009**: Package type tests, unit tests, lint, and build pass; affected
  authentication tests pass. Authentication typecheck still reports unrelated
  pre-existing repository symbols and registry/test fixture errors.

## 7. Risks & Assumptions

- **RISK-001**: Existing authentication aggregates may rely on the old
  base-constructor validation or public event API; all call sites must migrate
  atomically.
- **RISK-002**: Replacing mutable `Date` exposure may require small changes to
  domain code that currently mutates dates in place.
- **RISK-003**: Requiring explicit event IDs/timestamps may require a shared
  application-level ID/clock provider; this must remain outside the domain
  model.
- **ASSUMPTION-001**: Authentication package changes are in scope because they
  directly consume the breaking `@rineex/ddd` API.
- **ASSUMPTION-002**: Mappers are the approved persistence rehydration boundary.
- **ASSUMPTION-003**: No event store or event-sourcing behavior is required by
  this task.

## 8. Related Specifications / Further Reading

- [DDD primitive hardening design](../docs/superpowers/specs/2026-08-08-ddd-primitives-design.md)
- [DDD usage guide](../packages/ddd/docs/DDD-GUIDE.md)
- [DDD API migration guide](../packages/ddd/docs/MIGRATION.md)
- [Clean DDD and Hexagonal skill](../.agents/skills/clean-ddd-hexagonal/SKILL.md)
