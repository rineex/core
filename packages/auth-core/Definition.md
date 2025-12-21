## Step 1 — Define **Auth Method SPI (Plugin Contract)**

This is the **most critical step**. If this is wrong, everything after becomes
rigid.

---

# Auth Method SPI — Domain-Level Contract

## 1. Goal of This Step

Define **how authentication methods plug into the core** without:

- Modifying domain logic
- Adding conditionals (`if password`, `if oauth`)
- Leaking protocol / provider / infra concerns
- Forcing storage or transport choices

This SPI must support:

- Password
- Passwordless
- OTP
- OAuth / OIDC
- Social login
- Future methods (passkeys, DID, etc.)

---

## 2. What an Auth Method IS (and is NOT)

### ✅ IS

- A **capability descriptor**
- A **set of required inputs**
- A **type of proof produced**
- A **participant in a flow**

### ❌ IS NOT

- A service with business logic
- A protocol implementation
- A provider SDK wrapper
- A controller or handler
- A persistence concern

If logic creeps in here → stop.

---

## 3. Core Domain Abstractions

### 3.1 AuthMethodType (Value Object)

Represents **identity**, not behavior.

```ts
AuthMethodType
- value: string
```

Rules:

- Stable identifier
- Configurable
- No enums hardcoded in domain

Examples:

- `password`
- `passwordless_email`
- `otp_totp`
- `oauth_oidc`
- `social_google`

---

### 3.2 AuthMethodDefinition (Domain Object)

This is the **plugin contract**.

```ts
AuthMethodDefinition
- type: AuthMethodType
- supportedFactors: Set<AuthFactorType>
- requiredInputs: Set<AuthInputType>
- outputProof: AuthProofType
- challengeCapable: boolean
```

This object:

- Is immutable
- Is registered at startup
- Contains **no logic**

---

## 4. Auth Inputs (What the method needs)

Auth methods declare **what they need**, not _how it arrives_.

```ts
AuthInputType -
  identifier -
  secret -
  otp -
  assertion -
  authorization_code -
  device_context -
  redirect_context;
```

Rules:

- Transport-agnostic
- Serializable
- Validated at boundaries

---

## 5. Auth Proof (What the method produces)

Auth methods **do not authenticate**. They produce **proof**.

```ts
AuthProofType - password_proof - otp_proof - oauth_proof - assertion_proof;
```

The **domain decides** what to do with the proof.

---

## 6. Verification Responsibility (Important)

Auth Methods **do not verify themselves**.

Verification is done via **ports**:

```ts
AuthProofVerifierPort
- verify(proof, context): VerificationResult
```

This allows:

- Swapping providers
- Mocking
- Enterprise overrides
- Multiple verification strategies

---

## 7. Method Registration Model

Auth methods are **registered**, not hardcoded.

```ts
AuthMethodRegistry - register(definition) - get(type) - list();
```

Rules:

- Registry is read-only at runtime
- Domain depends only on interface
- Infrastructure provides implementations

---

## 8. Example (Conceptual, Not Implementation)

| Method     | Inputs              | Proof           | Factor     |
| ---------- | ------------------- | --------------- | ---------- |
| Password   | identifier + secret | password_proof  | knowledge  |
| Magic Link | identifier          | assertion_proof | possession |
| OTP        | identifier + otp    | otp_proof       | possession |
| OAuth      | authorization_code  | oauth_proof     | delegated  |
| API Token  | token               | assertion_proof | possession |

Notice:

- No HTTP
- No redirects
- No JWT
- No providers

---

## 9. What This Enables

With this SPI, you can:

- Add a new auth method **without touching domain logic**
- Compose methods into MFA
- Enable / disable methods via config
- Support enterprise overrides
- Keep core stable for years

---

## 10. Hard Validation Checklist

Before moving forward, confirm:

- No logic inside method definitions
- No branching by method type
- No enum explosion
- No provider coupling
- No storage assumptions

If any fails → redesign now.

---

## Step 1 Status

✅ Auth Method SPI defined ✅ Extensible ✅ Domain-pure ✅ Hexagonal-safe

---

# Step 2 — Authentication Flow DSL (Orchestration Model)

This step defines **how authentication happens**, without:

- Hard-coding flows
- Coupling to methods
- Assuming HTTP redirects
- Embedding logic in code paths

If flows are not modeled explicitly, you will **never** support enterprise auth
cleanly.

---

## 1. Purpose of Authentication Flow

An **Authentication Flow** answers one question:

> _“In what order, under what conditions, and with which rules are auth methods
> executed?”_

It must support:

- Single-step auth (password, social)
- Multi-step auth (OTP, MFA)
- Conditional auth (risk-based)
- Enterprise SSO
- Future orchestration (passkeys, step-up)

---

## 2. Core Principle (Non-Negotiable)

**Flows are data, not code.**

No:

```ts
if (method === 'password') { ... }
```

Instead:

- Declarative steps
- Explicit transitions
- Policy-driven decisions

---

## 3. Flow as a Domain Concept

### AuthenticationFlow (Domain Object)

```ts
AuthenticationFlow
- flowId
- name
- steps: AuthFlowStep[]
- entryConditions
- exitConditions
```

Rules:

- Immutable
- Versionable
- Serializable
- Loaded at startup or via config

---

## 4. Flow Step Model

### AuthFlowStep

```ts
AuthFlowStep
- stepId
- authMethodType
- required: boolean
- onSuccess: Transition
- onFailure: Transition
- onChallenge?: Transition
```

Each step:

- Executes **exactly one Auth Method**
- Produces a proof
- Does NOT decide success globally

---

## 5. Transition Model

### Transition

```ts
Transition
- targetStepId | terminalState
- condition?: PolicyExpression
```

Terminal states:

- `AUTHENTICATED`
- `FAILED`
- `CHALLENGED`

This enables:

- Retry
- Step-up
- Short-circuiting

---

## 6. Policy Expressions (Referenced, Not Implemented Yet)

Flows do **not** evaluate logic themselves.

They reference policies:

```ts
PolicyExpression - policyId - parameters;
```

Examples:

- `risk.score > threshold`
- `principal.trustLevel < required`
- `device.notTrusted`

(Policy language comes in Step 4.)

---

## 7. AuthenticationAttempt Lifecycle (Flow-Driven)

The flow **drives the attempt**, not the other way around.

States:

- `Initialized`
- `InProgress`
- `AwaitingChallenge`
- `Succeeded`
- `Failed`

Rules:

- One flow per attempt
- Steps are executed sequentially
- Proofs are accumulated
- Finalization happens only at terminal state

---

## 8. Example Flows (Conceptual)

### 8.1 Simple Password Flow

```
Step 1: password
  onSuccess → AUTHENTICATED
  onFailure → FAILED
```

---

### 8.2 Password + OTP (MFA)

```
Step 1: password
  onSuccess → Step 2
  onFailure → FAILED

Step 2: otp
  onSuccess → AUTHENTICATED
  onFailure → FAILED
```

---

### 8.3 Risk-Based Step-Up

```
Step 1: password
  onSuccess →
    if risk.low → AUTHENTICATED
    if risk.high → Step 2

Step 2: otp
  onSuccess → AUTHENTICATED
  onFailure → FAILED
```

---

### 8.4 OAuth / Social Login

```
Step 1: oauth_oidc
  onSuccess → AUTHENTICATED
  onFailure → FAILED
  onChallenge → AWAITING_EXTERNAL_ASSERTION
```

No redirects modeled. That’s infrastructure.

---

## 9. What Flows Explicitly Do NOT Know

Flows do **not** know about:

- HTTP redirects
- UI screens
- Cookies
- Tokens
- OAuth providers
- Mobile vs web
- DB schemas

They only know:

- Steps
- Transitions
- Policies

---

## 10. Extensibility Guarantees

With this DSL, you can:

- Add new auth methods without new flows
- Add new flows without code changes
- Customize enterprise flows via config
- Reuse flows across products
- Audit authentication behavior deterministically

---

## 11. Validation Checklist (Must Pass)

Before moving forward:

✔ Flow is declarative ✔ No branching by method type ✔ No protocol assumptions ✔
No infrastructure knowledge ✔ Supports MFA and step-up ✔ Serializable and
versionable

If any fails → redesign.

---

## Step 2 Status

✅ Authentication Flow DSL defined ✅ Orchestration decoupled from methods ✅
Enterprise-ready ✅ Hexagonal-safe

---

# Step 3 — **AuthenticationAttempt Lifecycle (Aggregate Rules)**

This step defines **the heart of correctness**. If this aggregate is weak,
you’ll get replay attacks, broken MFA, and inconsistent auth state.

---

## 1. Purpose of AuthenticationAttempt

An **AuthenticationAttempt** represents:

> _One and only one execution of an authentication flow._

It exists to:

- Enforce invariants
- Track progress across steps
- Collect proofs
- Coordinate challenges
- Produce a single outcome

It is the **source of truth** for authentication state.

---

## 2. Why This Must Be an Aggregate Root

Because it controls **critical invariants**:

- A step cannot be skipped
- A proof cannot be reused
- An attempt cannot succeed twice
- A failed attempt cannot be resumed
- MFA ordering must be enforced

If this is not an aggregate → bugs are guaranteed.

---

## 3. AuthenticationAttempt Structure (Conceptual)

**Aggregate Root: AuthenticationAttempt**

**Key Attributes**

- AttemptId
- FlowId
- PrincipalId? (optional initially)
- CurrentStepId
- Status
- CollectedProofs
- StartedAt
- CompletedAt?

---

## 4. Attempt States (Strict State Machine)

Only these states are allowed:

1. `Initialized`
2. `InProgress`
3. `AwaitingChallenge`
4. `Succeeded`
5. `Failed`

No others. No “partial success”.

---

## 5. State Transition Rules (Non-Negotiable)

### 5.1 Initialization

- Created with a Flow
- No proofs
- No session
- Status = `Initialized`

Allowed transitions:

- → `InProgress`

---

### 5.2 InProgress

- Actively executing a flow step
- Accepts exactly **one proof per step**

Allowed transitions:

- → `AwaitingChallenge`
- → `Succeeded`
- → `Failed`

---

### 5.3 AwaitingChallenge

Used when:

- External action is required
- OTP sent
- OAuth assertion pending
- Push approval pending

Rules:

- No new step allowed
- Only challenge response accepted

Allowed transitions:

- → `InProgress`
- → `Failed`

---

### 5.4 Succeeded (Terminal)

Rules:

- Immutable
- Produces AuthenticationSession
- No further actions allowed

---

### 5.5 Failed (Terminal)

Rules:

- Immutable
- No retry inside same attempt
- New attempt required

---

## 6. Proof Handling Rules

Proofs are **append-only**.

Rules:

- One proof per step
- Proof must match expected AuthMethodType
- Proof must be verified before progressing
- Proofs cannot be modified or deleted

This guarantees:

- Auditability
- Determinism
- Replay prevention

---

## 7. Step Advancement Rules

The aggregate enforces:

- Steps must be executed in order
- Transition conditions must be satisfied
- Skipping steps is forbidden
- Optional steps are flow-defined, not attempt-defined

The attempt **does not decide** what the next step is. It **asks the flow**.

---

## 8. Failure Semantics (Important)

Failures are **final**.

Examples:

- Wrong password → Failed
- OTP expired → Failed
- OAuth assertion invalid → Failed

Retries:

- Require a **new AuthenticationAttempt**
- Rate limiting is policy/infrastructure concern

This avoids:

- State confusion
- Timing attacks
- Complex rollback logic

---

## 9. Relationship to Other Aggregates

- Uses **AuthenticationFlow** (read-only)
- Produces **AuthenticationSession**
- References **Principal**, but does not own it
- Uses **Policies**, but does not evaluate them

No bidirectional coupling.

---

## 10. What AuthenticationAttempt Does NOT Do

Explicitly forbidden:

- Creating credentials
- Issuing tokens
- Storing secrets
- Evaluating risk
- Talking to HTTP
- Calling providers

It enforces **process**, not mechanics.

---

## 11. Invariant Checklist (Must Always Hold)

✔ One flow per attempt ✔ One terminal state only ✔ No step skipping ✔ No proof
reuse ✔ No resurrection after failure ✔ Deterministic outcome

If any invariant breaks → security issue.

---

## 12. Step 3 Status

✅ Aggregate boundaries defined ✅ State machine enforced ✅ MFA-safe ✅
Replay-safe ✅ Audit-ready

---

# Step 4 — **Authentication Policy Model (Risk, Conditions, Step-Up)**

This step defines **who is allowed to authenticate, under what conditions, and
with which strength** — without hard-coding logic.

If policies are not modeled cleanly, you will:

- Hard-code MFA rules
- Fork enterprise behavior
- Break extensibility
- Lose auditability

---

## 1. Purpose of Policy in Auth Domain

A **Policy** answers questions like:

- Is this authentication allowed?
- Is step-up required?
- Which flow should apply?
- Is this context risky?
- Is the current proof sufficient?

Policies **do not authenticate**. They **constrain and steer** authentication.

---

## 2. Core Principle (Non-Negotiable)

**Policies are declarative and evaluative — never procedural.**

No:

```ts
if (ip === 'x') requireOtp();
```

Yes:

- Policy definitions
- Policy evaluation results
- Policy-driven decisions

---

## 3. Policy as a First-Class Domain Concept

### AuthenticationPolicy (Domain Object)

```ts
AuthenticationPolicy
- policyId
- name
- scope
- rules: PolicyRule[]
- effect
```

Rules:

- Immutable
- Versionable
- Serializable
- Configurable per tenant / environment

---

## 4. Policy Scope

Policies apply at different levels:

```ts
PolicyScope =
  | Global
  | Principal
  | AuthMethod
  | AuthFlow
  | Resource
```

Examples:

- Global MFA enforcement
- Principal-specific restrictions
- Method-specific constraints
- Flow selection rules

---

## 5. Policy Rules (Atomic Conditions)

### PolicyRule

```ts
PolicyRule
- condition: ConditionExpression
- action: PolicyAction
```

Each rule:

- Evaluates **one condition**
- Produces **one action**
- Has no side effects

---

## 6. Condition Model (What can be checked)

Conditions evaluate **context**, never infrastructure.

```ts
ConditionExpression - subject - operator - value;
```

### Common Subjects

- risk.score
- principal.trustLevel
- device.trusted
- location.country
- time.window
- auth.method
- auth.factor
- attempt.count

### Operators

- equals
- notEquals
- greaterThan
- lessThan
- in
- notIn

---

## 7. Policy Actions (What can be enforced)

Actions **do not perform authentication**.

```ts
PolicyAction =
  | Allow
  | Deny
  | RequireStepUp
  | SelectFlow
  | LimitTrustLevel
```

Examples:

- Require OTP if risk > threshold
- Deny auth from blocked country
- Force enterprise SSO
- Downgrade session trust

---

## 8. Policy Evaluation Result

Policies return **decisions**, not behavior.

```ts
PolicyEvaluationResult
- decision
- requiredFlow?
- requiredAuthFactors?
- maxTrustLevel?
- reasons[]
```

This allows:

- Explainability
- Auditing
- Compliance

---

## 9. Policy Evaluation Responsibility

Policies are **evaluated by a Domain Service**, not entities.

```ts
AuthenticationPolicyEvaluator
- evaluate(context): PolicyEvaluationResult
```

Context includes:

- Principal snapshot
- AuthenticationAttempt snapshot
- Device/context snapshot
- Risk assessment (via port)

---

## 10. Relationship with Authentication Flow

Policies can:

- Select a flow
- Alter transitions
- Require additional steps

Flows **reference policies**, but do not contain logic.

This separation allows:

- Same flow, different behavior
- Enterprise overrides
- Runtime reconfiguration

---

## 11. Example Policies (Conceptual)

### 11.1 Risk-Based MFA

```
IF risk.score > 70
THEN RequireStepUp (otp)
```

---

### 11.2 Geo Restriction

```
IF location.country IN blockedCountries
THEN Deny
```

---

### 11.3 Trust Downgrade

```
IF device.trusted = false
THEN LimitTrustLevel = LOW
```

---

### 11.4 Flow Selection

```
IF principal.type = Service
THEN SelectFlow = m2m_flow
```

---

## 12. What Policies Explicitly Do NOT Do

Forbidden:

- Issuing challenges
- Sending OTPs
- Creating sessions
- Calling providers
- Accessing databases directly
- Knowing HTTP headers

They only **decide**.

---

## 13. Extensibility Guarantees

With this model you can:

- Add new conditions without changing flows
- Add new actions without breaking domain
- Support enterprise policy engines later
- Audit decisions deterministically

---

## 14. Step 4 Status

✅ Policy model defined ✅ Risk-adaptive ready ✅ Enterprise-grade ✅
Explainable and auditable

---

# Step 5 — **Credential Lifecycle Modeling**

This step defines **what a credential is**, how it is created, validated,
rotated, revoked, and expired — without storing secrets or coupling to storage.

If credential lifecycle is vague, security degrades fast.

---

## 1. Purpose of Credential in Auth Domain

A **Credential** represents:

> _A verifiable authentication capability bound to a Principal._

It is **not**:

- A password hash
- An OTP secret
- A token
- A provider artifact

Those are **infrastructure details**.

---

## 2. Credential as a Domain Entity

### Credential (Entity)

```ts
Credential
- CredentialId
- PrincipalId
- AuthMethodType
- AuthFactorType
- Status
- IssuedAt
- ExpiresAt?
- LastUsedAt?
- Metadata
```

---

## 3. Credential Status (Finite State)

```ts
CredentialStatus =
  | Active
  | Suspended
  | Revoked
  | Expired
  | Compromised
```

Rules:

- Revoked and Compromised are terminal
- Expired is time-based
- Suspended is reversible

---

## 4. Credential Invariants (Strict)

A credential must always satisfy:

- Belongs to exactly one Principal
- Is bound to exactly one Auth Method
- Cannot be reused across principals
- Cannot be reactivated after Revocation
- Cannot authenticate if not Active
- Cannot exist without lifecycle metadata

Violation = security bug.

---

## 5. Credential Creation Rules

Credential creation:

- Is explicit
- Requires policy approval
- Produces **no secret** in domain
- Delegates material generation to infrastructure

Example:

- Domain: “Create OTP credential”
- Infra: Generates secret, stores it securely

---

## 6. Credential Usage Rules

On each successful authentication:

- Credential status must be Active
- Expiration must be checked
- Usage timestamp may be updated
- Compromise signals may suspend or revoke

Credential usage is **observed**, not enforced here.

---

## 7. Credential Rotation & Replacement

Rotation is modeled as:

- Create new credential
- Activate new
- Suspend or revoke old

No mutation-in-place.

This allows:

- Auditability
- Rollback
- Compliance

---

## 8. Credential Revocation

Revocation reasons:

- User action
- Admin action
- Policy decision
- Risk detection
- Breach response

Revocation:

- Is immediate
- Is irreversible
- Must propagate to infra adapters

---

## 9. Credential Expiration

Expiration:

- Is time-based
- Evaluated at authentication time
- Does not delete credential
- Transitions to Expired

Deletion is **not** domain responsibility.

---

## 10. Relationship to AuthenticationAttempt

- Attempts **reference** credentials
- Attempts do not own credentials
- Credential state is checked during verification
- No attempt may mutate credential directly

---

## 11. Credential Types (Examples)

| Method    | Credential Meaning     |
| --------- | ---------------------- |
| Password  | Knowledge credential   |
| OTP       | Possession credential  |
| OAuth     | Delegated credential   |
| API Token | Possession credential  |
| Passkey   | Possession + inherence |

Types are **data**, not inheritance.

---

## 12. What Credential Does NOT Know

Explicitly forbidden:

- Hash algorithms
- OTP secrets
- Token formats
- Storage engines
- Providers
- Encryption

Those live behind ports.

---

## 13. Ports Related to Credentials

```ts
CredentialRepository;
CredentialMaterialStore(infra);
CredentialUsageReporter;
CredentialRevocationPublisher;
```

Domain only depends on interfaces.

---

## 14. Extensibility Guarantees

With this model:

- New credential types require no domain change
- Infra can store secrets however it wants
- Enterprise policies can control lifecycle
- Auditing is deterministic

---

## 15. Step 5 Status

✅ Credential lifecycle defined ✅ Security invariants enforced ✅
Storage-agnostic ✅ Enterprise-ready

---

We continue. This is the **last foundational domain step**.

---

# Step 6 — **AuthenticationSession & Trust Levels**

This step defines **what “being authenticated” actually means** in your system,
independent of tokens, cookies, or transport.

If this is weak, authorization, SSO, and enterprise security all collapse.

---

## 1. Purpose of AuthenticationSession

An **AuthenticationSession** represents:

> _A time-bounded, trust-scoped result of a successful authentication._

It is:

- The output of Authentication
- The input to Authorization
- The anchor for SSO, re-auth, and step-up

It is **not**:

- A cookie
- A JWT
- A refresh token
- An HTTP session

Those are representations.

---

## 2. AuthenticationSession as Aggregate Root

### AuthenticationSession (Aggregate Root)

```ts
AuthenticationSession -
  SessionId -
  PrincipalId -
  FlowId -
  IssuedAt -
  ExpiresAt -
  TrustLevel -
  AuthFactorsUsed -
  ContextSnapshot -
  Status;
```

---

## 3. Session Status (Finite State)

```ts
SessionStatus =
  | Active
  | Expired
  | Revoked
```

Rules:

- Expired is time-based
- Revoked is explicit and terminal
- Active is the only usable state

---

## 4. Trust Level (Critical Concept)

### TrustLevel (Value Object)

Trust is **not binary**.

```ts
TrustLevel =
  | Anonymous
  | Low
  | Medium
  | High
```

Interpretation:

- **Anonymous** → unauthenticated
- **Low** → weak auth (magic link, social)
- **Medium** → single strong factor
- **High** → MFA / hardware-backed

Trust is:

- Computed from proofs + policies
- Stored in session
- Used by authorization

---

## 5. Trust Level Invariants

- TrustLevel is **assigned at session creation**
- TrustLevel can be **downgraded**
- TrustLevel can **never be upgraded in-place**
- Upgrade requires **new AuthenticationAttempt**

This prevents silent privilege escalation.

---

## 6. Relationship to AuthenticationAttempt

- Exactly one session per successful attempt
- Attempt produces session
- Session references attempt context (read-only)
- Session lifecycle is independent afterward

No circular dependency.

---

## 7. Context Snapshot (Why It Exists)

### ContextSnapshot (Value Object)

Captures authentication context **at time of issuance**:

- Device trust
- Location
- Risk score
- Auth methods used
- Policies applied

Why:

- Auditability
- Compliance
- Forensic analysis
- Future policy checks

Context is **immutable**.

---

## 8. Session Expiration Rules

Expiration is:

- Deterministic
- Policy-driven
- Evaluated by infrastructure
- Reflected in domain state

Domain does not:

- Refresh sessions
- Slide expiration
- Issue refresh tokens

Those are adapters.

---

## 9. Session Revocation

Revocation triggers:

- User logout
- Admin action
- Credential revocation
- Risk detection
- Policy violation

Revocation:

- Is explicit
- Is immediate
- Invalidates all representations

---

## 10. SSO Compatibility (Important)

SSO is simply:

- Multiple representations
- One AuthenticationSession

This model supports:

- Web SSO
- Mobile SSO
- API SSO
- Cross-app SSO

Without special logic.

---

## 11. What AuthenticationSession Does NOT Know

Explicitly forbidden:

- JWT claims
- Cookies
- Headers
- OAuth tokens
- HTTP
- Storage engine

It only knows **meaning**, not format.

---

## 12. Ports Related to Sessions

```ts
AuthenticationSessionRepository;
SessionRevocationPublisher;
SessionExpirationScheduler;
SessionRepresentationFactory(infra);
```

Domain defines contracts only.

---

## 13. Extensibility Guarantees

With this model:

- You can change token formats freely
- You can support SSO without refactor
- You can add step-up auth cleanly
- You can audit auth decisions years later

---

## 14. Step 6 Status

✅ AuthenticationSession modeled ✅ Trust levels explicit ✅ Step-up safe ✅
Authorization-ready ✅ Enterprise-grade

---

# 🎯 Foundation Complete

You now have a **complete, extensible, production-grade Auth Domain**:

1. Auth Method SPI
2. Authentication Flow DSL
3. AuthenticationAttempt lifecycle
4. Policy model
5. Credential lifecycle
6. AuthenticationSession & Trust
