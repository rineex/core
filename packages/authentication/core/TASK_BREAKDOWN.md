# Task Breakdown: Detailed Implementation Tasks

This document provides granular, actionable tasks that can be converted to
GitHub issues or project management tickets.

---

## 📦 Phase 1: Foundation - Flow DSL & Proof System

### Task 1.1.1: Create FlowId Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Description:** Create a `FlowId` value object following the pattern of
`AuthAttemptId`.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/flow-id.vo.ts`
- [ ] Extends `PrimitiveValueObject<string>` or uses UUID
- [ ] Has `create()` factory method
- [ ] Validates non-empty value
- [ ] Has `toString()` method
- [ ] Unit tests with 100% coverage

**Implementation Notes:**

- Follow existing value object patterns in codebase
- Use UUID format for uniqueness
- Add to `src/domain/identity/value-objects/index.ts`

---

### Task 1.1.2: Create TerminalState Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 1 hour  
**Dependencies:** None

**Description:** Create a `TerminalState` value object representing flow
terminal states.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/terminal-state.vo.ts`
- [ ] Values: `AUTHENTICATED`, `FAILED`, `CHALLENGED`
- [ ] Immutable enum-like value object
- [ ] Has `is()` and `isNot()` methods
- [ ] Unit tests

**Implementation Notes:**

- Can be enum or union type wrapped in value object
- Follow `AuthStatus` pattern

---

### Task 1.1.3: Create Transition Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** Task 1.1.2

**Description:** Create a `Transition` value object that represents flow step
transitions.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/transition.vo.ts`
- [ ] Properties: `targetStepId?: string`, `terminalState?: TerminalState`
- [ ] Exactly one of `targetStepId` or `terminalState` must be set
- [ ] Optional `condition?: PolicyExpression` (can be string reference for now)
- [ ] Validation ensures mutual exclusivity
- [ ] Unit tests

**Implementation Notes:**

- Use discriminated union or validation
- PolicyExpression can be a string reference initially

---

### Task 1.1.4: Create AuthFlowStep Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 1.1.3

**Description:** Create an `AuthFlowStep` value object representing a single
step in a flow.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/auth-flow-step.vo.ts`
- [ ] Properties:
  - `stepId: string`
  - `authMethodType: AuthMethodName`
  - `required: boolean`
  - `onSuccess: Transition`
  - `onFailure: Transition`
  - `onChallenge?: Transition`
- [ ] Immutable
- [ ] Validation ensures stepId is non-empty
- [ ] Unit tests

**Implementation Notes:**

- Use readonly properties
- Validate transitions are valid

---

### Task 1.2.1: Create AuthenticationFlow Aggregate

**Type:** Aggregate Root  
**Priority:** Critical  
**Estimated Time:** 8 hours  
**Dependencies:** Task 1.1.4

**Description:** Create the `AuthenticationFlow` aggregate root that defines
authentication flows.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/aggregates/authentication-flow.aggregate.ts`
- [ ] Properties:
  - `flowId: FlowId`
  - `name: string`
  - `steps: AuthFlowStep[]`
  - `entryConditions?: PolicyExpression[]`
  - `exitConditions?: PolicyExpression[]`
- [ ] Factory method: `create(flowId, name, steps, ...)`
- [ ] Method: `getStep(stepId): AuthFlowStep | null`
- [ ] Method: `getFirstStep(): AuthFlowStep`
- [ ] Method: `isValid(): boolean`
- [ ] Validation:
  - At least one step
  - First step exists
  - Terminal states reachable
  - No circular dependencies
- [ ] Domain events (if needed)
- [ ] Unit tests with edge cases

**Implementation Notes:**

- Follow `AuthenticationAttempt` aggregate pattern
- Use `AggregateRoot` from `@rineex/ddd`
- Validation is critical for security

---

### Task 1.2.2: Add Flow Domain Events

**Type:** Domain Event  
**Priority:** Low  
**Estimated Time:** 2 hours  
**Dependencies:** Task 1.2.1

**Description:** Create domain events for flow lifecycle (if needed).

**Acceptance Criteria:**

- [ ] Events: `FlowCreatedEvent` (if needed)
- [ ] Follow existing event patterns
- [ ] Unit tests

**Implementation Notes:**

- May not be needed if flows are configuration
- Check if events add value

---

### Task 1.3.1: Create AuthProofType Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Description:** Create `AuthProofType` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/auth-proof-type.vo.ts`
- [ ] Values: `password_proof`, `otp_proof`, `oauth_proof`, `assertion_proof`,
      `challenge_proof`
- [ ] Immutable enum-like
- [ ] Unit tests

---

### Task 1.3.2: Create AuthProof Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 1.3.1

**Description:** Create `AuthProof` value object representing authentication
proof.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/auth-proof.vo.ts`
- [ ] Properties:
  - `proofId: string` (UUID)
  - `proofType: AuthProofType`
  - `methodType: AuthMethodName`
  - `issuedAt: Date`
  - `metadata: Record<string, unknown>`
- [ ] Factory method: `create(...)`
- [ ] Method: `toObject()` for serialization
- [ ] Validation:
  - proofId is UUID
  - issuedAt is valid date
  - metadata is serializable
- [ ] Unit tests

**Implementation Notes:**

- Proofs are immutable
- Metadata should be validated for serialization

---

### Task 1.4.1: Update AuthStatus Value Object

**Type:** Value Object  
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Description:** Add new states to `AuthStatus` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/auth-status.vo.ts`
- [ ] Add states: `INITIALIZED`, `IN_PROGRESS`, `AWAITING_CHALLENGE`
- [ ] Keep existing: `SUCCEEDED`, `FAILED`
- [ ] Update validation
- [ ] Update tests
- [ ] Ensure backward compatibility if possible

**Implementation Notes:**

- May need to deprecate `PENDING` or map it to `INITIALIZED`
- Check existing usages

---

### Task 1.4.2: Update AuthenticationAttempt Props

**Type:** Aggregate  
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** Task 1.1.1, Task 1.3.2

**Description:** Add flow-related properties to `AuthenticationAttempt`.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/aggregates/authentication-attempt.aggregate.ts`
- [ ] Add to props:
  - `flowId: FlowId`
  - `currentStepId?: string`
  - `collectedProofs: AuthProof[]`
- [ ] Update factory method signature
- [ ] Ensure backward compatibility
- [ ] Update tests

**Implementation Notes:**

- May need migration strategy for existing attempts
- Keep `method` for backward compat initially

---

### Task 1.4.3: Add Flow Methods to AuthenticationAttempt

**Type:** Aggregate  
**Priority:** Critical  
**Estimated Time:** 8 hours  
**Dependencies:** Task 1.4.2, Task 1.2.1

**Description:** Add methods to `AuthenticationAttempt` for flow execution.

**Acceptance Criteria:**

- [ ] Method: `startFlow(flow: AuthenticationFlow): void`
  - Transition: `INITIALIZED` → `IN_PROGRESS`
  - Set `currentStepId` to first step
  - Emit event
- [ ] Method: `completeStep(proof: AuthProof): void`
  - Validate proof matches current step method
  - Add proof to `collectedProofs`
  - Transition based on flow step's `onSuccess`
- [ ] Method: `failStep(reason: string): void`
  - Transition based on flow step's `onFailure`
- [ ] Method: `awaitChallenge(): void`
  - Transition to `AWAITING_CHALLENGE`
- [ ] Method: `resumeFromChallenge(): void`
  - Transition back to `IN_PROGRESS`
- [ ] Method: `getCurrentStep(flow: AuthenticationFlow): AuthFlowStep | null`
- [ ] Method: `advanceToNextStep(transition: Transition): void`
- [ ] Update `succeed()` and `fail()` to validate terminal states
- [ ] Unit tests for all methods
- [ ] Integration tests for flow execution

**Implementation Notes:**

- Methods should enforce invariants
- State transitions must be validated
- Proofs are append-only

---

### Task 1.5.1: Create Flow Repository Port

**Type:** Port  
**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** Task 1.2.1

**Description:** Create repository port for `AuthenticationFlow`.

**Acceptance Criteria:**

- [ ] File: `src/ports/outbound/authentication-flow-repository.port.ts`
- [ ] Interface:
  ```typescript
  AuthenticationFlowRepositoryPort {
    findById(flowId: FlowId): Promise<AuthenticationFlow | null>
    findAll(): Promise<AuthenticationFlow[]>
    save(flow: AuthenticationFlow): Promise<void>
  }
  ```
- [ ] Add to `src/ports/outbound/index.ts`

**Implementation Notes:**

- No implementation (infrastructure concern)
- Follow existing port patterns

---

## 📦 Phase 2: Trust & Session System

### Task 2.1.1: Create TrustLevel Value Object

**Type:** Value Object  
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** None

**Description:** Create `TrustLevel` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/session/value-objects/trust-level.vo.ts`
- [ ] Values: `ANONYMOUS`, `LOW`, `MEDIUM`, `HIGH`
- [ ] Method: `compare(other: TrustLevel): number`
- [ ] Method: `isAtLeast(level: TrustLevel): boolean`
- [ ] Method: `downgradeTo(level: TrustLevel): TrustLevel`
  - Only allows downgrade
  - Throws if upgrade attempted
- [ ] Unit tests

**Implementation Notes:**

- Trust levels are ordered
- Cannot upgrade in-place

---

### Task 2.2.1: Create ContextSnapshot Value Object

**Type:** Value Object  
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** None

**Description:** Create `ContextSnapshot` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/session/value-objects/context-snapshot.vo.ts`
- [ ] Properties:
  - `deviceTrusted?: boolean`
  - `location?: { country?: string, ipAddress?: string }`
  - `riskScore?: number`
  - `authMethodsUsed: AuthMethodName[]`
  - `policiesApplied: string[]`
  - `capturedAt: Date`
- [ ] Factory: `capture(context: AuthContext, ...): ContextSnapshot`
- [ ] Method: `toObject()` for serialization
- [ ] Unit tests

**Implementation Notes:**

- Snapshot is immutable
- Captured at session creation time

---

### Task 2.3.1: Create SessionStatus Value Object

**Type:** Value Object  
**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** None

**Description:** Create `SessionStatus` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/session/value-objects/session-status.vo.ts`
- [ ] Values: `ACTIVE`, `EXPIRED`, `REVOKED`
- [ ] Follow `AuthStatus` pattern
- [ ] Unit tests

---

### Task 2.3.2: Create AuthenticationSession Aggregate

**Type:** Aggregate Root  
**Priority:** High  
**Estimated Time:** 12 hours  
**Dependencies:** Task 2.1.1, Task 2.2.1, Task 2.3.1, Task 1.3.2

**Description:** Create `AuthenticationSession` aggregate root.

**Acceptance Criteria:**

- [ ] File: `src/domain/session/aggregates/authentication-session.aggregate.ts`
- [ ] Properties:
  - `sessionId: SessionId`
  - `principalId: IdentityId`
  - `flowId: FlowId`
  - `attemptId: AuthAttemptId`
  - `issuedAt: Date`
  - `expiresAt: Date`
  - `trustLevel: TrustLevel`
  - `authFactorsUsed: AuthFactor[]`
  - `contextSnapshot: ContextSnapshot`
  - `status: SessionStatus`
- [ ] Factory:
      `createFromAttempt(attempt: AuthenticationAttempt, ...): AuthenticationSession`
- [ ] Method:
      `computeTrustLevel(proofs: AuthProof[], policies: Policy[]): TrustLevel`
- [ ] Method: `revoke(at: Date): void`
- [ ] Method: `isExpired(now: Date): boolean`
- [ ] Method: `downgradeTrust(level: TrustLevel): void`
- [ ] Method: `extractAuthFactors(proofs: AuthProof[]): AuthFactor[]`
- [ ] Domain events: `SessionCreatedEvent`, `SessionRevokedEvent`
- [ ] Unit tests
- [ ] Integration tests

**Implementation Notes:**

- Trust computation logic is critical
- Follow existing aggregate patterns

---

### Task 2.4.1: Create Session Repository Port

**Type:** Port  
**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** Task 2.3.2

**Description:** Create repository port for `AuthenticationSession`.

**Acceptance Criteria:**

- [ ] File: `src/ports/outbound/authentication-session-repository.port.ts`
- [ ] Interface:
  ```typescript
  AuthenticationSessionRepositoryPort {
    save(session: AuthenticationSession): Promise<void>
    findById(sessionId: SessionId): Promise<AuthenticationSession | null>
    findByPrincipalId(principalId: IdentityId): Promise<AuthenticationSession[]>
    revoke(sessionId: SessionId): Promise<void>
  }
  ```

---

## 📦 Phase 3: Credential Lifecycle

### Task 3.1.1: Create CredentialId Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Description:** Create `CredentialId` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/credential-id.vo.ts`
- [ ] UUID-based
- [ ] Follow existing ID patterns
- [ ] Unit tests

---

### Task 3.1.2: Create CredentialStatus Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** None

**Description:** Create `CredentialStatus` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/value-objects/credential-status.vo.ts`
- [ ] Values: `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`, `COMPROMISED`
- [ ] Validation for status transitions
- [ ] Method: `canTransitionTo(newStatus: CredentialStatus): boolean`
- [ ] Unit tests

**Implementation Notes:**

- REVOKED and COMPROMISED are terminal
- EXPIRED is time-based
- SUSPENDED is reversible

---

### Task 3.2.1: Create Credential Entity

**Type:** Entity  
**Priority:** Medium  
**Estimated Time:** 10 hours  
**Dependencies:** Task 3.1.1, Task 3.1.2

**Description:** Create `Credential` entity.

**Acceptance Criteria:**

- [ ] File: `src/domain/identity/entities/credential.entity.ts`
- [ ] Properties:
  - `credentialId: CredentialId`
  - `principalId: IdentityId`
  - `authMethodType: AuthMethodName`
  - `authFactorType: AuthFactorType`
  - `status: CredentialStatus`
  - `issuedAt: Date`
  - `expiresAt?: Date`
  - `lastUsedAt?: Date`
  - `metadata: Record<string, unknown>`
- [ ] Factory: `create(...): Credential`
- [ ] Method: `suspend(): void`
- [ ] Method: `revoke(reason: string): void`
- [ ] Method: `markAsCompromised(): void`
- [ ] Method: `recordUsage(at: Date): void`
- [ ] Method: `checkExpiration(now: Date): void`
- [ ] Method: `isUsable(): boolean`
- [ ] Domain events: `CredentialCreatedEvent`, `CredentialRevokedEvent`, etc.
- [ ] Unit tests

**Implementation Notes:**

- No secrets stored (infrastructure concern)
- Lifecycle must be enforced

---

### Task 3.3.1: Create Credential Repository Port

**Type:** Port  
**Priority:** Medium  
**Estimated Time:** 1 hour  
**Dependencies:** Task 3.2.1

**Description:** Create repository port for `Credential`.

**Acceptance Criteria:**

- [ ] File: `src/ports/outbound/credential-repository.port.ts`
- [ ] Interface with methods for CRUD operations
- [ ] Method: `findByPrincipalAndMethod(...)`

---

## 📦 Phase 4: Enhanced Orchestration

### Task 4.1.1: Update AuthOrchestratorService Constructor

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** Phase 1, Phase 2

**Description:** Update orchestrator to accept new dependencies.

**Acceptance Criteria:**

- [ ] Add `flowRepository: AuthenticationFlowRepositoryPort`
- [ ] Add `sessionRepository: AuthenticationSessionRepositoryPort`
- [ ] Update constructor signature
- [ ] Update tests

---

### Task 4.1.2: Implement Flow Selection Logic

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 4.1.1

**Description:** Add method to select flow from command or policy.

**Acceptance Criteria:**

- [ ] Method:
      `selectFlow(command: StartAuthenticationCommand): Promise<AuthenticationFlow>`
- [ ] Check if command specifies flow
- [ ] Otherwise use policy to select
- [ ] Default to single-step flow for method
- [ ] Unit tests

---

### Task 4.1.3: Implement Step Execution Logic

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** Task 4.1.2

**Description:** Add method to execute a flow step.

**Acceptance Criteria:**

- [ ] Method:
      `executeStep(attempt: AuthenticationAttempt, flow: AuthenticationFlow): Promise<void>`
- [ ] Get current step from flow
- [ ] Resolve auth method for step
- [ ] Call method's authenticate()
- [ ] Handle result (success/failure/challenge)
- [ ] Unit tests

---

### Task 4.1.4: Implement Step Result Handling

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** Task 4.1.3

**Description:** Add method to handle step results and advance flow.

**Acceptance Criteria:**

- [ ] Method:
      `handleStepResult(attempt: AuthenticationAttempt, proof: AuthProof, flow: AuthenticationFlow): Promise<void>`
- [ ] Add proof to attempt
- [ ] Get transition from current step
- [ ] Evaluate transition condition (if any)
- [ ] Advance to next step or terminal state
- [ ] Unit tests

---

### Task 4.1.5: Implement Attempt Finalization

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 4.1.4

**Description:** Add method to finalize attempt and create session.

**Acceptance Criteria:**

- [ ] Method:
      `finalizeAttempt(attempt: AuthenticationAttempt): Promise<AuthenticationSession>`
- [ ] Only if attempt succeeded
- [ ] Create session from attempt
- [ ] Save session
- [ ] Return session
- [ ] Unit tests

---

### Task 4.1.6: Update Orchestrator Execute Method

**Type:** Application Service  
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** All Task 4.1.x

**Description:** Refactor main execute method to use flows.

**Acceptance Criteria:**

- [ ] Update `execute()` to use flow system
- [ ] Call `selectFlow()`
- [ ] Create attempt with flow
- [ ] Call `startFlow()`
- [ ] Execute steps sequentially
- [ ] Handle challenges
- [ ] Finalize attempt
- [ ] Integration tests

---

## 📦 Phase 5: Policy Domain Objects

### Task 5.1.1: Create PolicyScope Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Description:** Create `PolicyScope` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/policy/value-objects/policy-scope.vo.ts`
- [ ] Values: `GLOBAL`, `PRINCIPAL`, `AUTH_METHOD`, `AUTH_FLOW`, `RESOURCE`
- [ ] Unit tests

---

### Task 5.1.2: Create ConditionExpression Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** None

**Description:** Create `ConditionExpression` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/policy/value-objects/condition-expression.vo.ts`
- [ ] Properties: `subject: string`, `operator: Operator`, `value: unknown`
- [ ] Operator enum: `equals`, `notEquals`, `greaterThan`, `lessThan`, `in`,
      `notIn`
- [ ] Validation
- [ ] Unit tests

---

### Task 5.1.3: Create PolicyAction Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** Task 2.1.1

**Description:** Create `PolicyAction` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/policy/value-objects/policy-action.vo.ts`
- [ ] Discriminated union:
  - `{ type: 'ALLOW' }`
  - `{ type: 'DENY'; reason: string }`
  - `{ type: 'REQUIRE_STEP_UP'; requiredFactors: string[] }`
  - `{ type: 'SELECT_FLOW'; flowId: FlowId }`
  - `{ type: 'LIMIT_TRUST_LEVEL'; level: TrustLevel }`
- [ ] Unit tests

---

### Task 5.1.4: Create PolicyRule Value Object

**Type:** Value Object  
**Priority:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** Task 5.1.2, Task 5.1.3

**Description:** Create `PolicyRule` value object.

**Acceptance Criteria:**

- [ ] File: `src/domain/policy/value-objects/policy-rule.vo.ts`
- [ ] Properties: `condition: ConditionExpression`, `action: PolicyAction`,
      `reason?: string`
- [ ] Unit tests

---

### Task 5.1.5: Create AuthenticationPolicy Aggregate

**Type:** Aggregate Root  
**Priority:** Medium  
**Estimated Time:** 8 hours  
**Dependencies:** Task 5.1.4, Task 5.1.1

**Description:** Create `AuthenticationPolicy` aggregate.

**Acceptance Criteria:**

- [ ] File: `src/domain/policy/aggregates/authentication-policy.aggregate.ts`
- [ ] Properties:
  - `policyId: string`
  - `name: string`
  - `scope: PolicyScope`
  - `rules: PolicyRule[]`
  - `version: number`
  - `metadata?: Record<string, unknown>`
- [ ] Factory: `create(...)`
- [ ] Method: `evaluate(context: AuthPolicyContext): PolicyEvaluationResult`
- [ ] Validation: at least one rule
- [ ] Serializable
- [ ] Unit tests

---

### Task 5.2.1: Update Policy Engine

**Type:** Domain Service  
**Priority:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** Task 5.1.5

**Description:** Update policy engine to use domain objects.

**Acceptance Criteria:**

- [ ] Update `AuthPolicyEngine` to accept `AuthenticationPolicy[]`
- [ ] Call `policy.evaluate()` on each
- [ ] Aggregate results
- [ ] Maintain backward compatibility if needed
- [ ] Unit tests

---

## 📦 Phase 6: Integration & Testing

### Task 6.1.1: Update Domain Exports

**Type:** Infrastructure  
**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** All phases

**Description:** Export all new domain objects.

**Acceptance Criteria:**

- [ ] Update `src/domain/index.ts`
- [ ] Update `src/domain/identity/index.ts`
- [ ] Update `src/domain/session/index.ts`
- [ ] Update `src/domain/policy/index.ts`
- [ ] Ensure proper module boundaries

---

### Task 6.2.1: Create Flow Execution Integration Tests

**Type:** Test  
**Priority:** High  
**Estimated Time:** 8 hours  
**Dependencies:** Phase 4

**Description:** Create integration tests for flow execution.

**Acceptance Criteria:**

- [ ] File: `src/__tests__/integration/flow-execution.test.ts`
- [ ] Test: Single-step password flow
- [ ] Test: Multi-step password + OTP flow
- [ ] Test: Challenge handling
- [ ] Test: Flow transitions
- [ ] All tests passing

---

### Task 6.2.2: Create Trust Level Integration Tests

**Type:** Test  
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** Phase 2

**Description:** Create integration tests for trust level computation.

**Acceptance Criteria:**

- [ ] File: `src/__tests__/integration/trust-level-computation.test.ts`
- [ ] Test: Trust from single factor
- [ ] Test: Trust from MFA
- [ ] Test: Trust downgrade
- [ ] All tests passing

---

### Task 6.2.3: Create Session Creation Integration Tests

**Type:** Test  
**Priority:** High  
**Estimated Time:** 6 hours  
**Dependencies:** Phase 2, Phase 4

**Description:** Create integration tests for session creation.

**Acceptance Criteria:**

- [ ] File: `src/__tests__/integration/session-creation.test.ts`
- [ ] Test: Session from successful attempt
- [ ] Test: Trust level in session
- [ ] Test: Context snapshot
- [ ] All tests passing

---

### Task 6.3.1: Update README

**Type:** Documentation  
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** All phases

**Description:** Update README with new features and examples.

**Acceptance Criteria:**

- [ ] Document flow DSL
- [ ] Document trust levels
- [ ] Add usage examples
- [ ] Update feature list

---

### Task 6.3.2: Create Flow Examples

**Type:** Documentation  
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** Phase 1

**Description:** Create example flow definitions.

**Acceptance Criteria:**

- [ ] Example: Password flow
- [ ] Example: Password + OTP flow
- [ ] Example: Risk-based step-up flow
- [ ] Example: OAuth flow
- [ ] Documented in README or examples/

---

## 📊 Summary

**Total Tasks:** 50+  
**Estimated Total Time:** ~200-250 hours  
**Critical Path:** Phase 1 → Phase 4  
**Can Parallelize:** Phase 2 & 3 (after Phase 1)

---

## 🎯 Next Steps

1. Review this task breakdown
2. Create GitHub issues/projects from tasks
3. Start with Task 1.1.1 (FlowId Value Object)
4. Work incrementally, test as you go
5. Review after each phase

Good luck! 🚀
