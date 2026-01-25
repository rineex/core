# Quick Onboarding Guide: What's Missing in Auth Core

## 🚨 Critical Missing Pieces

### 1. **Authentication Flow DSL** (Step 2)

**Status:** ❌ **NOT IMPLEMENTED**  
**Impact:** Cannot support multi-step auth, MFA orchestration, or conditional
flows

**What Should Exist:**

```typescript
// Should exist but doesn't:
AuthenticationFlow {
  flowId: FlowId
  steps: AuthFlowStep[]
  // ...
}

AuthFlowStep {
  stepId: string
  authMethodType: AuthMethodName
  onSuccess: Transition
  onFailure: Transition
  // ...
}
```

**Current Reality:**

- `AuthOrchestratorService` directly calls `authMethod.authenticate()`
- No flow definition or step tracking
- No multi-step support

---

### 2. **Flow-Driven AuthenticationAttempt**

**Status:** ❌ **MISSING FEATURES**

**What's Missing:**

```typescript
// Current AuthenticationAttempt has:
- status: PENDING | SUCCEEDED | FAILED
- method: AuthMethod
- identityId?: IdentityId

// But should also have:
- flowId: FlowId              // ❌ MISSING
- currentStepId: StepId         // ❌ MISSING
- collectedProofs: AuthProof[] // ❌ MISSING
- States: Initialized | InProgress | AwaitingChallenge // ❌ MISSING
```

**Impact:**

- Cannot track progress through multi-step flows
- Cannot collect proofs for trust computation
- Cannot support MFA properly

---

### 3. **Auth Proof System**

**Status:** ❌ **NOT IMPLEMENTED**

**What Should Exist:**

```typescript
// Should exist but doesn't:
AuthProof {
  proofType: AuthProofType
  methodType: AuthMethodName
  issuedAt: Date
  metadata: Record<string, unknown>
}
```

**Impact:**

- Cannot track which authentication factors were used
- Cannot compute trust levels
- No audit trail of proofs

---

### 4. **Credential Entity**

**Status:** ❌ **NOT IMPLEMENTED**

**What Should Exist:**

```typescript
// Should exist but doesn't:
Credential {
  credentialId: CredentialId
  principalId: IdentityId
  authMethodType: AuthMethodName
  status: Active | Suspended | Revoked | Expired | Compromised
  issuedAt: Date
  expiresAt?: Date
  lastUsedAt?: Date
}
```

**Impact:**

- Cannot track credential lifecycle
- Cannot revoke credentials
- Cannot check credential status during auth
- No credential rotation support

---

### 5. **AuthenticationSession Aggregate**

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Current:** `Session` entity exists but is minimal

**What's Missing:**

```typescript
// Current Session has:
- identityId
- token
- expiresAt
- revokedAt

// Should also have:
- trustLevel: TrustLevel        // ❌ MISSING
- contextSnapshot: ContextSnapshot // ❌ MISSING
- authFactorsUsed: AuthFactor[]  // ❌ MISSING
- flowId: FlowId                 // ❌ MISSING
- createFromAttempt() factory    // ❌ MISSING
```

**Impact:**

- Cannot compute or store trust levels
- Cannot support step-up authentication
- Cannot audit authentication context

---

### 6. **Trust Level System**

**Status:** ❌ **NOT IMPLEMENTED**

**What Should Exist:**

```typescript
// Should exist but doesn't:
TrustLevel = Anonymous | Low | Medium | High

// Computed from:
- Auth factors used
- Policies applied
- Risk assessment
```

**Impact:**

- Cannot differentiate authentication strength
- Cannot enforce trust-based authorization
- Cannot support step-up flows

---

### 7. **Policy Domain Objects**

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Current:** Only contracts exist (`AuthPolicyEvaluator`)

**What's Missing:**

```typescript
// Should exist but doesn't:
AuthenticationPolicy {
  policyId: string
  scope: PolicyScope
  rules: PolicyRule[]
  // ...
}

PolicyRule {
  condition: ConditionExpression
  action: PolicyAction
}
```

**Impact:**

- Policies are procedural, not declarative
- Cannot serialize/version policies
- Cannot configure policies via data

---

## 📊 Implementation Status

| Component             | Documented | Implemented | Status                             |
| --------------------- | ---------- | ----------- | ---------------------------------- |
| Auth Method SPI       | ✅         | ⚠️ Partial  | Basic structure exists             |
| **Flow DSL**          | ✅         | ❌ **0%**   | **CRITICAL MISSING**               |
| AuthenticationAttempt | ✅         | ⚠️ 40%      | Basic states, no flow              |
| **Auth Proof**        | ✅         | ❌ **0%**   | **CRITICAL MISSING**               |
| **Credential**        | ✅         | ❌ **0%**   | **CRITICAL MISSING**               |
| AuthenticationSession | ✅         | ⚠️ 30%      | Basic entity, missing trust        |
| **Trust Level**       | ✅         | ❌ **0%**   | **CRITICAL MISSING**               |
| Policy Engine         | ✅         | ⚠️ 50%      | Contracts exist, no domain objects |
| MFA Domain            | ✅         | ✅ 90%      | Well implemented                   |
| OAuth Domain          | ✅         | ⚠️ 60%      | Basic structure exists             |

---

## 🔍 Where to Look

### Current Working Code

- ✅ `src/domain/identity/aggregates/authentication-attempt.aggregate.ts` -
  Basic attempt tracking
- ✅ `src/domain/mfa/aggregates/mfa-session.aggregate.ts` - MFA implementation
- ✅ `src/application/services/auth-orchestrator.service.ts` - Basic
  orchestration
- ✅ `src/domain/policy/engine/auth-policy-engine.ts` - Policy evaluation

### Design Documents

- 📖 `Definition.md` - Complete design (Steps 1-6)
- 📖 `Architecture.md` - Architectural principles
- 📖 `RULES.md` - Implementation rules

### What Needs to Be Built

1. **Flow System**
   (`src/domain/identity/aggregates/authentication-flow.aggregate.ts`)
2. **Proof System** (`src/domain/identity/value-objects/auth-proof.vo.ts`)
3. **Credential Entity** (`src/domain/identity/entities/credential.entity.ts`)
4. **Trust Level** (`src/domain/session/value-objects/trust-level.vo.ts`)
5. **Session Aggregate**
   (`src/domain/session/aggregates/authentication-session.aggregate.ts`)

---

## 🎯 Next Steps for Implementation

### Priority 1: Flow System (Blocks Everything)

1. Create `AuthenticationFlow` aggregate
2. Create `AuthFlowStep` and `Transition` value objects
3. Update `AuthenticationAttempt` to track flow and steps
4. Update orchestrator to execute flows

### Priority 2: Proof & Trust (Enables Advanced Features)

1. Create `AuthProof` value object
2. Create `TrustLevel` value object
3. Implement proof collection in attempts
4. Compute trust levels from proofs

### Priority 3: Credential & Session (Security & Audit)

1. Create `Credential` entity
2. Create `AuthenticationSession` aggregate
3. Implement session creation from attempts
4. Add credential status checks

---

## 💡 Key Insights

1. **Current orchestrator is too simple** - It just calls methods directly, no
   flow execution
2. **No proof tracking** - Cannot audit what factors were used
3. **No trust levels** - Cannot differentiate authentication strength
4. **No credential lifecycle** - Security features missing
5. **Policies are procedural** - Should be declarative/data-driven

**The core is ~40% complete** - Foundation exists but critical orchestration
pieces are missing.
