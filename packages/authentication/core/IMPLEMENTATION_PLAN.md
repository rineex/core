# Implementation Plan: Completing Auth Core

This document outlines the step-by-step plan to implement all missing pieces identified in the gap analysis.

## 🎯 Goals

1. Implement Authentication Flow DSL (Step 2)
2. Add Auth Proof system
3. Implement Credential lifecycle
4. Complete AuthenticationSession aggregate with Trust Levels
5. Make AuthenticationAttempt flow-driven
6. Enhance Policy domain objects

---

## 📋 Phase 1: Foundation - Flow DSL & Proof System

**Goal:** Enable multi-step authentication flows and proof tracking

**Duration:** ~2-3 weeks

### Task 1.1: Create Flow Value Objects
**Priority:** Critical  
**Dependencies:** None

**Files to Create:**
- `src/domain/identity/value-objects/flow-id.vo.ts`
- `src/domain/identity/value-objects/auth-flow-step.vo.ts`
- `src/domain/identity/value-objects/transition.vo.ts`
- `src/domain/identity/value-objects/terminal-state.vo.ts`

**Implementation Steps:**
1. Create `FlowId` value object (similar to `AuthAttemptId`)
2. Create `TerminalState` enum/value object: `AUTHENTICATED | FAILED | CHALLENGED`
3. Create `Transition` value object:
   ```typescript
   Transition {
     targetStepId?: string
     terminalState?: TerminalState
     condition?: PolicyExpression // Reference for now
   }
   ```
4. Create `AuthFlowStep` value object:
   ```typescript
   AuthFlowStep {
     stepId: string
     authMethodType: AuthMethodName
     required: boolean
     onSuccess: Transition
     onFailure: Transition
     onChallenge?: Transition
   }
   ```

**Acceptance Criteria:**
- ✅ All value objects are immutable
- ✅ Validation logic in place
- ✅ Serializable to JSON
- ✅ Tests for each value object

---

### Task 1.2: Create AuthenticationFlow Aggregate
**Priority:** Critical  
**Dependencies:** Task 1.1

**Files to Create:**
- `src/domain/identity/aggregates/authentication-flow.aggregate.ts`
- `src/domain/identity/events/flow-created.event.ts` (if needed)

**Implementation Steps:**
1. Create `AuthenticationFlow` aggregate root:
   ```typescript
   AuthenticationFlow {
     flowId: FlowId
     name: string
     steps: AuthFlowStep[]
     entryConditions?: PolicyExpression[]
     exitConditions?: PolicyExpression[]
   }
   ```
2. Add factory method: `create(flowId, name, steps)`
3. Add validation:
   - At least one step
   - First step must exist
   - Terminal states must be reachable
   - No circular dependencies
4. Add method: `getStep(stepId): AuthFlowStep | null`
5. Add method: `getFirstStep(): AuthFlowStep`
6. Add method: `isValid(): boolean`

**Acceptance Criteria:**
- ✅ Flow is immutable after creation
- ✅ Validation prevents invalid flows
- ✅ Can serialize/deserialize flows
- ✅ Tests for flow validation
- ✅ Tests for step retrieval

---

### Task 1.3: Create Auth Proof System
**Priority:** Critical  
**Dependencies:** None (can be parallel with Task 1.1)

**Files to Create:**
- `src/domain/identity/value-objects/auth-proof-type.vo.ts`
- `src/domain/identity/value-objects/auth-proof.vo.ts`

**Implementation Steps:**
1. Create `AuthProofType` value object:
   ```typescript
   AuthProofType = 
     | 'password_proof'
     | 'otp_proof'
     | 'oauth_proof'
     | 'assertion_proof'
     | 'challenge_proof'
   ```
2. Create `AuthProof` value object:
   ```typescript
   AuthProof {
     proofId: string (UUID)
     proofType: AuthProofType
     methodType: AuthMethodName
     issuedAt: Date
     metadata: Record<string, unknown>
   }
   ```
3. Add validation:
   - proofId must be unique
   - issuedAt must be valid date
   - metadata is optional but serializable
4. Add method: `toObject()` for serialization

**Acceptance Criteria:**
- ✅ Proof is immutable
- ✅ Can serialize/deserialize
- ✅ Tests for proof creation and validation

---

### Task 1.4: Update AuthenticationAttempt for Flow-Driven
**Priority:** Critical  
**Dependencies:** Task 1.1, Task 1.2, Task 1.3

**Files to Update:**
- `src/domain/identity/aggregates/authentication-attempt.aggregate.ts`
- `src/domain/identity/value-objects/auth-status.vo.ts` (add new states)

**Implementation Steps:**
1. Update `AuthStatus` to include:
   ```typescript
   AuthStatus = 
     | 'INITIALIZED'
     | 'IN_PROGRESS'
     | 'AWAITING_CHALLENGE'
     | 'SUCCEEDED'
     | 'FAILED'
   ```
2. Update `AuthenticationAttemptProps`:
   ```typescript
   interface AuthenticationAttemptProps {
     flowId: FlowId                    // NEW
     currentStepId?: string            // NEW
     collectedProofs: AuthProof[]     // NEW
     status: AuthStatus
     method: AuthMethod               // Keep for backward compat
     identityId?: IdentityId
   }
   ```
3. Update factory method `start()`:
   - Accept `AuthenticationFlow` instead of just `AuthMethod`
   - Set `flowId` and `currentStepId` to first step
   - Initialize `collectedProofs` as empty array
   - Set status to `INITIALIZED`
4. Add method: `startFlow(flow: AuthenticationFlow): void`
   - Transition from `INITIALIZED` → `IN_PROGRESS`
   - Set `currentStepId` to first step
5. Add method: `completeStep(proof: AuthProof): void`
   - Validate proof matches current step's method
   - Add proof to `collectedProofs`
   - Transition based on flow step's `onSuccess`
6. Add method: `failStep(reason: string): void`
   - Transition based on flow step's `onFailure`
7. Add method: `awaitChallenge(): void`
   - Transition to `AWAITING_CHALLENGE`
8. Add method: `resumeFromChallenge(): void`
   - Transition back to `IN_PROGRESS`
9. Add method: `getCurrentStep(): AuthFlowStep | null`
   - Query flow for current step
10. Add method: `advanceToNextStep(transition: Transition): void`
    - Validate transition
    - Update `currentStepId`
    - Handle terminal states
11. Update `succeed()` and `fail()`:
    - Only allow if in terminal state transition
    - Validate all required steps completed

**Acceptance Criteria:**
- ✅ Attempt tracks flow and current step
- ✅ Proofs are collected per step
- ✅ State transitions follow flow definition
- ✅ Cannot skip steps
- ✅ Cannot reuse proofs
- ✅ Tests for all state transitions
- ✅ Tests for proof collection
- ✅ Tests for step advancement

---

### Task 1.5: Create Flow Repository Port
**Priority:** High  
**Dependencies:** Task 1.2

**Files to Create:**
- `src/ports/outbound/authentication-flow-repository.port.ts`

**Implementation Steps:**
1. Create port interface:
   ```typescript
   AuthenticationFlowRepositoryPort {
     findById(flowId: FlowId): Promise<AuthenticationFlow | null>
     findAll(): Promise<AuthenticationFlow[]>
     save(flow: AuthenticationFlow): Promise<void>
   }
   ```

**Acceptance Criteria:**
- ✅ Port interface defined
- ✅ No implementation (infrastructure concern)

---

## 📋 Phase 2: Trust & Session System

**Goal:** Implement trust levels and complete session aggregate

**Duration:** ~1-2 weeks

### Task 2.1: Create Trust Level Value Object
**Priority:** High  
**Dependencies:** None

**Files to Create:**
- `src/domain/session/value-objects/trust-level.vo.ts`

**Implementation Steps:**
1. Create `TrustLevel` value object:
   ```typescript
   TrustLevel = 
     | 'ANONYMOUS'  // 0 - unauthenticated
     | 'LOW'        // 1 - weak auth (magic link, social)
     | 'MEDIUM'     // 2 - single strong factor
     | 'HIGH'       // 3 - MFA / hardware-backed
   ```
2. Add method: `compare(other: TrustLevel): number` (for ordering)
3. Add method: `isAtLeast(level: TrustLevel): boolean`
4. Add method: `downgradeTo(level: TrustLevel): TrustLevel` (only allows downgrade)

**Acceptance Criteria:**
- ✅ Trust levels are ordered
- ✅ Cannot upgrade in-place (new attempt required)
- ✅ Tests for comparison and downgrade logic

---

### Task 2.2: Create Context Snapshot Value Object
**Priority:** High  
**Dependencies:** None

**Files to Create:**
- `src/domain/session/value-objects/context-snapshot.vo.ts`

**Implementation Steps:**
1. Create `ContextSnapshot` value object:
   ```typescript
   ContextSnapshot {
     deviceTrusted?: boolean
     location?: {
       country?: string
       ipAddress?: string
     }
     riskScore?: number
     authMethodsUsed: AuthMethodName[]
     policiesApplied: string[] // policy IDs
     capturedAt: Date
   }
   ```
2. Add factory: `capture(context: AuthContext, ...): ContextSnapshot`
3. Add validation for required fields

**Acceptance Criteria:**
- ✅ Immutable snapshot
- ✅ Serializable
- ✅ Tests for snapshot creation

---

### Task 2.3: Create AuthenticationSession Aggregate
**Priority:** High  
**Dependencies:** Task 2.1, Task 2.2, Task 1.3

**Files to Create:**
- `src/domain/session/aggregates/authentication-session.aggregate.ts`
- `src/domain/session/value-objects/session-status.vo.ts`
- `src/domain/session/events/session-created.event.ts`
- `src/domain/session/events/session-revoked.event.ts`

**Files to Update/Replace:**
- `src/domain/session/entities/session.entity.ts` (may need to replace or refactor)

**Implementation Steps:**
1. Create `SessionStatus` value object:
   ```typescript
   SessionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'
   ```
2. Create `AuthenticationSession` aggregate:
   ```typescript
   AuthenticationSession {
     sessionId: SessionId
     principalId: IdentityId
     flowId: FlowId
     attemptId: AuthAttemptId
     issuedAt: Date
     expiresAt: Date
     trustLevel: TrustLevel
     authFactorsUsed: AuthFactor[]
     contextSnapshot: ContextSnapshot
     status: SessionStatus
   }
   ```
3. Add factory: `createFromAttempt(attempt: AuthenticationAttempt, ...): AuthenticationSession`
   - Extract proofs from attempt
   - Compute trust level from proofs + policies
   - Capture context snapshot
   - Set expiration based on policy
4. Add method: `computeTrustLevel(proofs: AuthProof[], policies: Policy[]): TrustLevel`
   - Rules:
     - No proofs → ANONYMOUS
     - Only passwordless/social → LOW
     - Single strong factor → MEDIUM
     - MFA or hardware → HIGH
5. Add method: `revoke(at: Date): void`
   - Transition to REVOKED
   - Emit event
6. Add method: `isExpired(now: Date): boolean`
7. Add method: `downgradeTrust(level: TrustLevel): void`
   - Only allows downgrade
8. Add method: `extractAuthFactors(proofs: AuthProof[]): AuthFactor[]`

**Acceptance Criteria:**
- ✅ Session created only from successful attempt
- ✅ Trust level computed correctly
- ✅ Cannot upgrade trust in-place
- ✅ Revocation works correctly
- ✅ Tests for session creation
- ✅ Tests for trust computation
- ✅ Tests for revocation

---

### Task 2.4: Create Session Repository Port
**Priority:** High  
**Dependencies:** Task 2.3

**Files to Create:**
- `src/ports/outbound/authentication-session-repository.port.ts`

**Implementation Steps:**
1. Create port interface:
   ```typescript
   AuthenticationSessionRepositoryPort {
     save(session: AuthenticationSession): Promise<void>
     findById(sessionId: SessionId): Promise<AuthenticationSession | null>
     findByPrincipalId(principalId: IdentityId): Promise<AuthenticationSession[]>
     revoke(sessionId: SessionId): Promise<void>
   }
   ```

**Acceptance Criteria:**
- ✅ Port interface defined

---

## 📋 Phase 3: Credential Lifecycle

**Goal:** Implement credential management

**Duration:** ~1-2 weeks

### Task 3.1: Create Credential Value Objects
**Priority:** Medium  
**Dependencies:** None

**Files to Create:**
- `src/domain/identity/value-objects/credential-id.vo.ts`
- `src/domain/identity/value-objects/credential-status.vo.ts`

**Implementation Steps:**
1. Create `CredentialId` value object (UUID-based)
2. Create `CredentialStatus` value object:
   ```typescript
   CredentialStatus = 
     | 'ACTIVE'
     | 'SUSPENDED'
     | 'REVOKED'
     | 'EXPIRED'
     | 'COMPROMISED'
   ```
3. Add validation for status transitions:
   - REVOKED and COMPROMISED are terminal
   - EXPIRED is time-based
   - SUSPENDED is reversible

**Acceptance Criteria:**
- ✅ Status transitions validated
- ✅ Tests for status transitions

---

### Task 3.2: Create Credential Entity
**Priority:** Medium  
**Dependencies:** Task 3.1

**Files to Create:**
- `src/domain/identity/entities/credential.entity.ts`
- `src/domain/identity/events/credential-created.event.ts`
- `src/domain/identity/events/credential-revoked.event.ts`
- `src/domain/identity/events/credential-suspended.event.ts`

**Implementation Steps:**
1. Create `Credential` entity:
   ```typescript
   Credential {
     credentialId: CredentialId
     principalId: IdentityId
     authMethodType: AuthMethodName
     authFactorType: AuthFactorType
     status: CredentialStatus
     issuedAt: Date
     expiresAt?: Date
     lastUsedAt?: Date
     metadata: Record<string, unknown>
   }
   ```
2. Add factory: `create(...): Credential`
   - Status starts as ACTIVE
   - No secrets stored (infrastructure concern)
3. Add method: `suspend(): void`
   - Transition to SUSPENDED
   - Emit event
4. Add method: `revoke(reason: string): void`
   - Transition to REVOKED (terminal)
   - Emit event
5. Add method: `markAsCompromised(): void`
   - Transition to COMPROMISED (terminal)
   - Emit event
6. Add method: `recordUsage(at: Date): void`
   - Update `lastUsedAt`
7. Add method: `checkExpiration(now: Date): void`
   - Transition to EXPIRED if expired
8. Add method: `isUsable(): boolean`
   - Returns true only if ACTIVE and not expired
9. Add validation:
   - Belongs to exactly one Principal
   - Bound to exactly one Auth Method
   - Cannot reactivate after REVOKED/COMPROMISED

**Acceptance Criteria:**
- ✅ Credential lifecycle enforced
- ✅ Cannot authenticate with non-ACTIVE credential
- ✅ Revocation is terminal
- ✅ Tests for all lifecycle operations

---

### Task 3.3: Create Credential Repository Port
**Priority:** Medium  
**Dependencies:** Task 3.2

**Files to Create:**
- `src/ports/outbound/credential-repository.port.ts`

**Implementation Steps:**
1. Create port interface:
   ```typescript
   CredentialRepositoryPort {
     save(credential: Credential): Promise<void>
     findById(credentialId: CredentialId): Promise<Credential | null>
     findByPrincipalId(principalId: IdentityId): Promise<Credential[]>
     findByPrincipalAndMethod(
       principalId: IdentityId,
       method: AuthMethodName
     ): Promise<Credential[]>
   }
   ```

**Acceptance Criteria:**
- ✅ Port interface defined

---

## 📋 Phase 4: Enhanced Orchestration

**Goal:** Update orchestrator to execute flows properly

**Duration:** ~1 week

### Task 4.1: Update AuthOrchestratorService
**Priority:** Critical  
**Dependencies:** Phase 1 complete, Phase 2 complete

**Files to Update:**
- `src/application/services/auth-orchestrator.service.ts`

**Implementation Steps:**
1. Update constructor to accept:
   - `flowRepository: AuthenticationFlowRepositoryPort`
   - `sessionRepository: AuthenticationSessionRepositoryPort`
   - `policyEngine: AuthPolicyEngine` (already exists)
2. Update `execute()` method:
   ```typescript
   async execute(command: StartAuthenticationCommand): Promise<AuthAttemptId> {
     // 1. Resolve or select flow (from command or policy)
     const flow = await this.selectFlow(command);
     
     // 2. Create attempt with flow
     const attempt = AuthenticationAttempt.start(attemptId, flow, command.identityId);
     
     // 3. Start flow execution
     attempt.startFlow(flow);
     
     // 4. Execute first step
     await this.executeStep(attempt, flow);
     
     // 5. Save attempt
     await this.attemptRepository.save(attempt);
     
     return attemptId;
   }
   ```
3. Add method: `selectFlow(command): Promise<AuthenticationFlow>`
   - Check if command specifies flow
   - Otherwise, use policy to select flow
   - Default to single-step flow for method
4. Add method: `executeStep(attempt, flow): Promise<void>`
   - Get current step from flow
   - Resolve auth method for step
   - Call method's authenticate()
   - Handle result:
     - Success → collect proof, advance
     - Failure → fail step
     - Challenge → await challenge
5. Add method: `handleStepResult(attempt, proof, flow): Promise<void>`
   - Add proof to attempt
   - Get transition from current step
   - Evaluate transition condition (if any)
   - Advance to next step or terminal state
6. Add method: `finalizeAttempt(attempt): Promise<AuthenticationSession>`
   - Only if attempt succeeded
   - Create session from attempt
   - Save session
   - Return session

**Acceptance Criteria:**
- ✅ Orchestrator executes flows, not just methods
- ✅ Steps executed sequentially
- ✅ Proofs collected properly
- ✅ Sessions created from attempts
- ✅ Tests for multi-step flows
- ✅ Tests for challenge handling

---

### Task 4.2: Create Flow Execution Service (Optional)
**Priority:** Medium  
**Dependencies:** Task 4.1

**Files to Create:**
- `src/application/services/flow-execution.service.ts`

**Implementation Steps:**
1. Extract flow execution logic from orchestrator
2. Handle step-by-step execution
3. Manage challenge states
4. Handle retries and failures

**Acceptance Criteria:**
- ✅ Flow execution is testable independently
- ✅ Can be reused by orchestrator

---

## 📋 Phase 5: Policy Domain Objects

**Goal:** Make policies declarative and serializable

**Duration:** ~1 week

### Task 5.1: Create Policy Domain Objects
**Priority:** Medium  
**Dependencies:** None

**Files to Create:**
- `src/domain/policy/aggregates/authentication-policy.aggregate.ts`
- `src/domain/policy/value-objects/policy-rule.vo.ts`
- `src/domain/policy/value-objects/condition-expression.vo.ts`
- `src/domain/policy/value-objects/policy-action.vo.ts`
- `src/domain/policy/value-objects/policy-scope.vo.ts`

**Implementation Steps:**
1. Create `PolicyScope` value object:
   ```typescript
   PolicyScope = 
     | 'GLOBAL'
     | 'PRINCIPAL'
     | 'AUTH_METHOD'
     | 'AUTH_FLOW'
     | 'RESOURCE'
   ```
2. Create `ConditionExpression` value object:
   ```typescript
   ConditionExpression {
     subject: string  // e.g., 'risk.score', 'device.trusted'
     operator: Operator  // equals, greaterThan, in, etc.
     value: unknown
   }
   ```
3. Create `PolicyAction` value object:
   ```typescript
   PolicyAction =
     | { type: 'ALLOW' }
     | { type: 'DENY'; reason: string }
     | { type: 'REQUIRE_STEP_UP'; requiredFactors: string[] }
     | { type: 'SELECT_FLOW'; flowId: FlowId }
     | { type: 'LIMIT_TRUST_LEVEL'; level: TrustLevel }
   ```
4. Create `PolicyRule` value object:
   ```typescript
   PolicyRule {
     condition: ConditionExpression
     action: PolicyAction
     reason?: string  // for audit
   }
   ```
5. Create `AuthenticationPolicy` aggregate:
   ```typescript
   AuthenticationPolicy {
     policyId: string
     name: string
     scope: PolicyScope
     rules: PolicyRule[]
     version: number
     metadata?: Record<string, unknown>
   }
   ```
6. Add factory: `create(policyId, name, scope, rules)`
7. Add method: `evaluate(context: AuthPolicyContext): PolicyEvaluationResult`
   - Evaluate rules in order
   - Return first matching action
8. Add validation:
   - At least one rule
   - Rules are valid

**Acceptance Criteria:**
- ✅ Policies are immutable
- ✅ Policies are serializable
- ✅ Policies can be versioned
- ✅ Tests for policy evaluation
- ✅ Tests for serialization

---

### Task 5.2: Update Policy Engine to Use Domain Objects
**Priority:** Medium  
**Dependencies:** Task 5.1

**Files to Update:**
- `src/domain/policy/engine/auth-policy-engine.ts`

**Implementation Steps:**
1. Update to accept `AuthenticationPolicy[]` instead of `AuthPolicyEvaluator[]`
2. Call `policy.evaluate(context)` on each policy
3. Aggregate results

**Acceptance Criteria:**
- ✅ Engine uses domain objects
- ✅ Backward compatible if needed

---

## 📋 Phase 6: Integration & Testing

**Goal:** Integrate all pieces and ensure everything works together

**Duration:** ~1 week

### Task 6.1: Update Domain Exports
**Priority:** High  
**Dependencies:** All previous phases

**Files to Update:**
- `src/domain/index.ts`
- `src/index.ts`

**Implementation Steps:**
1. Export all new aggregates, entities, value objects
2. Ensure proper module boundaries

---

### Task 6.2: Integration Tests
**Priority:** High  
**Dependencies:** All previous phases

**Files to Create:**
- `src/__tests__/integration/flow-execution.test.ts`
- `src/__tests__/integration/mfa-flow.test.ts`
- `src/__tests__/integration/trust-level-computation.test.ts`
- `src/__tests__/integration/session-creation.test.ts`

**Test Scenarios:**
1. Single-step password flow
2. Multi-step password + OTP flow
3. Risk-based step-up flow
4. Session creation with trust levels
5. Credential lifecycle operations
6. Policy evaluation in flows

---

### Task 6.3: Update Documentation
**Priority:** Medium  
**Dependencies:** All phases

**Files to Update:**
- `README.md`
- `Architecture.md` (if needed)
- Add examples of flow definitions

---

## 📊 Implementation Timeline

```
Week 1-2: Phase 1 (Flow DSL & Proof System)
Week 3:    Phase 2 (Trust & Session)
Week 4:    Phase 3 (Credential Lifecycle)
Week 5:    Phase 4 (Enhanced Orchestration)
Week 6:    Phase 5 (Policy Domain Objects)
Week 7:    Phase 6 (Integration & Testing)
```

**Total Estimated Duration:** 6-7 weeks

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Can define authentication flows declaratively
- ✅ Attempts track flow and steps
- ✅ Proofs are collected per step
- ✅ Multi-step flows execute correctly

### Phase 2 Complete When:
- ✅ Sessions have trust levels
- ✅ Trust computed from proofs
- ✅ Sessions created from attempts
- ✅ Trust downgrade works

### Phase 3 Complete When:
- ✅ Credentials can be created/revoked
- ✅ Credential status checked during auth
- ✅ Credential lifecycle enforced

### Phase 4 Complete When:
- ✅ Orchestrator executes flows
- ✅ Multi-step authentication works end-to-end
- ✅ Challenge handling works

### Phase 5 Complete When:
- ✅ Policies are declarative
- ✅ Policies are serializable/versionable
- ✅ Policy evaluation works

### Phase 6 Complete When:
- ✅ All integration tests pass
- ✅ Documentation updated
- ✅ Examples provided

---

## 🔍 Risk Mitigation

### Risk 1: Breaking Changes
**Mitigation:** 
- Keep backward compatibility where possible
- Use feature flags if needed
- Gradual migration path

### Risk 2: Complexity
**Mitigation:**
- Implement incrementally
- Test each phase thoroughly
- Refactor as needed

### Risk 3: Performance
**Mitigation:**
- Profile flow execution
- Optimize proof collection
- Cache flows if needed

---

## 📝 Notes

1. **Start with Phase 1** - Everything else depends on flows
2. **Test incrementally** - Don't wait until the end
3. **Keep architecture pure** - No infrastructure leaks
4. **Follow Definition.md** - It's the source of truth
5. **Update as you go** - Don't let docs drift

---

## 🚀 Getting Started

1. Review this plan
2. Set up feature branch
3. Start with Task 1.1 (Flow Value Objects)
4. Write tests first (TDD approach recommended)
5. Implement incrementally
6. Review and iterate

Good luck! 🎉
