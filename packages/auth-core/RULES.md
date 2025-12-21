
# Step 7 — Port & Adapter Map (with Bundle-Size & Modularization First)

This step defines **what gets compiled together, what is optional, and what can be tree-shaken**.

If this is wrong, your “install only what you need” promise is impossible.

---

## 1. Hard Requirement (Restated Clearly)

Your auth core must satisfy **all** of these:

* Zero required adapters
* Zero required auth methods
* Zero required storage
* Domain usable alone
* Each auth method installable separately
* Each adapter installable separately
* No transitive bloat
* Tree-shakable
* Side-effect free modules

If any package pulls more than it needs → fail.

---

## 2. High-Level Package Topology (Non-Negotiable)

This is the **only sane layout**:

```
@auth/core-domain        ← pure domain (mandatory)
@auth/core-ports         ← domain ports (mandatory)

@auth/method-password
@auth/method-passwordless
@auth/method-otp
@auth/method-oauth
@auth/method-passkey
...

@auth/adapter-memory
@auth/adapter-postgres
@auth/adapter-redis
@auth/adapter-http
@auth/adapter-jwt
@auth/adapter-oidc
...
```

### Rules

* `core-domain` depends on **nothing**
* `core-ports` depends only on `core-domain`
* Methods depend on `core-domain + core-ports`
* Adapters depend on `core-ports`
* No reverse dependencies. Ever.

---

## 3. What Lives in `@auth/core-domain`

**Only meaning and rules.**

Includes:

* Aggregates
* Entities
* Value Objects
* Domain Services
* Invariants
* Domain Events

Explicitly excluded:

* Interfaces to infra
* Repositories
* Verification logic
* Serialization
* Config loading

Bundle size: **tiny**
This package should never change often.

---

## 4. What Lives in `@auth/core-ports`

This is the **only dependency surface** for extensions.

### 4.1 Persistence Ports

```ts
PrincipalRepository
CredentialRepository
AuthenticationAttemptRepository
AuthenticationSessionRepository
```

Rules:

* No SQL
* No ORM
* No query builders
* No pagination logic

---

### 4.2 Capability / SPI Ports

```ts
AuthMethodRegistry
AuthProofVerifier
ChallengeIssuer
RiskEvaluator
TokenIssuer
SessionRepresentationFactory
```

Rules:

* Stateless interfaces
* No default implementations
* No optional methods
* No framework types

---

## 5. Auth Methods as Separately Installable Units

Each auth method is **one package**.

Example:

```
@auth/method-password
```

Contains:

* AuthMethodDefinition
* Required input schema (domain-level)
* Proof mapping
* Registration function

Does NOT contain:

* Hashing logic
* DB access
* HTTP handling
* SDKs

This guarantees:

* Installing OTP does not install OAuth
* Installing OAuth does not install JWT
* Bundle size stays minimal

---

## 6. Adapter Packages (Infra Only)

Adapters implement **one port group only**.

Bad ❌

> one adapter doing DB + HTTP + JWT

Good ✅

```
@auth/adapter-postgres
@auth/adapter-redis
@auth/adapter-jwt
@auth/adapter-http-express
@auth/adapter-http-hono
```

Each adapter:

* Implements interfaces from `core-ports`
* Knows nothing about domain internals
* Can be swapped freely

---

## 7. Dependency Direction (Strict)

This diagram must never be violated:

```
[ core-domain ]
        ↑
[ core-ports ]
        ↑
[ methods ]   [ adapters ]
```

Never:

* Adapter → Method
* Method → Adapter
* Domain → Port implementation
* Domain → Method

---

## 8. Tree-Shaking & Bundle Rules

To make bundle-size guarantees real:

* No side effects in module root
* No auto-registration
* Explicit `register()` calls
* Pure ES modules
* No global singletons
* No reflection-based loading

If a user doesn’t import it → it must not exist in bundle.

---

## 9. Runtime Composition (User Responsibility)

The **consumer** wires things together:

* Registers methods
* Provides adapters
* Selects flows
* Configures policies

Your core:

* Does not auto-wire
* Does not scan
* Does not assume environment

This keeps:

* Core small
* Behavior explicit
* Enterprise-safe

---

## 10. Validation Checklist (Must Pass)

Before moving forward:

✔ Core domain installs alone
✔ No auth method is mandatory
✔ No adapter is mandatory
✔ Importing one method doesn’t pull others
✔ Infra choices are replaceable
✔ Bundle analyzer shows only used code

If any fails → restructure now.

---

## Step 7 Status

✅ Port boundaries defined
✅ Modular packaging model defined
✅ Bundle-size safe
✅ Tree-shakable
✅ Enterprise-usable

---

# Step 9 — Minimal End-to-End Walkthrough (Passwordless)

> Goal: Show a complete authentication cycle using **Passwordless Email**, fully abstract, modular, and documented.

---

## 1. Module Setup (Separable & Installable)

```
@auth/core-domain
@auth/core-ports
@auth/method-passwordless
@auth/adapter-memory (optional for demonstration)
```

Rules:

* Core-domain + core-ports always installed
* Method installed separately
* Adapter optional
* No infra dependencies required

---

## 2. Example Domain Objects Involved

```ts
// AuthenticationAttempt aggregate
const attempt = AuthenticationAttempt.create({
  flowId: 'passwordless_flow',
  principalId: 'user-123'
});

// Principal entity exists
const principal = Principal.create({ id: 'user-123' });

// Credential for Passwordless (domain-only)
const credential = Credential.create({
  principalId: principal.id,
  methodType: 'passwordless_email',
  factor: 'possession',
  status: 'Active'
});
```

**Notes:**

* All objects are **domain-pure**.
* No secrets stored in domain.
* All lifecycle and invariants enforced.

---

## 3. AuthMethod Registration (SPI Usage)

```ts
const registry: IAuthMethodRegistry = new AuthMethodRegistry();

// Passwordless Method (installed separately)
const passwordlessMethod: IAuthMethod<{ email: string }, AuthProof> = new PasswordlessEmailMethod();

registry.register(passwordlessMethod);
```

**Documentation Notes:**

* Registration explicit, tree-shakable.
* SPI ensures domain does not know implementation.
* Developers can see registry calls in code history for traceability.

---

## 4. Authentication Flow Definition (DSL)

```ts
const passwordlessFlow = new AuthenticationFlow({
  flowId: 'passwordless_flow',
  name: 'Passwordless Email Flow',
  steps: [
    {
      stepId: 'email_link_step',
      authMethodType: 'passwordless_email',
      required: true,
      onSuccess: { targetStepId: 'terminal_success' },
      onFailure: { targetStepId: 'terminal_failed' }
    }
  ],
  entryConditions: [],
  exitConditions: []
});
```

**Documentation Notes:**

* Flow is declarative and versionable.
* Steps link to AuthMethodType.
* Developers reading code see the exact orchestration chain.
* Policy references are explicit (future step-up integration).

---

## 5. Creating AuthenticationAttempt

```ts
attempt.startFlow(passwordlessFlow);
```

* Creates domain snapshot
* Status = `InProgress`
* Step = first step
* Immutable reference to flow

**Documentation Notes:**

* All state transitions logged in code via events
* Chainable domain events can be traced to attempt creation

---

## 6. Issue Challenge (Passwordless Email Example)

```ts
const challenge = await passwordlessMethod.issueChallenge?.({
  principalId: principal.id,
  attemptId: attempt.id,
  metadata: { email: 'user@example.com' }
});
```

* Returns a Challenge object (domain-agnostic)
* No SMTP logic in domain
* Code clearly separates **domain vs infra**
* Challenge metadata traceable in code comments

---

## 7. Verify Challenge / Authenticate Step

```ts
const proof = await passwordlessMethod.verifyChallenge?.({
  challengeId: challenge.id,
  response: 'user-clicked-link'
}, { principalId: principal.id, attemptId: attempt.id });

if (proof) {
  attempt.completeStep(proof);
}
```

**Documentation Notes:**

* Proof is immutable and domain-pure
* Chainable: attempt -> proof -> session creation
* Developer reading this sees exact flow progression

---

## 8. Session Creation

```ts
const session = AuthenticationSession.createFromAttempt(attempt, {
  trustLevel: 'Medium'
});
```

* Generates domain session only
* No tokens, cookies, or DB
* TrustLevel reflects factors used
* ContextSnapshot stored for audit

**Documentation Notes:**

* Sessions are traceable back to attempt
* Code comments and JSDoc describe domain reasoning
* Any developer reading can follow entire chain

---

## 9. Policy Integration (Optional Hook)

```ts
const policyResult = policyEvaluator.evaluate({ attempt, session, context });
if (policyResult.decision === 'RequireStepUp') {
  // Step-up flow can be chained
}
```

**Notes:**

* Policies are referenced, not hard-coded
* Fully traceable, chainable in domain events

---

## 10. Summary of Traceable Chain

```
Principal -> Credential -> AuthFlow -> AuthenticationAttempt -> Challenge -> AuthProof -> AuthenticationSession
```

**All events are documented, chainable, and domain-pure**.
Developers reading code can **trace every step** without touching infra.

---

## 11. Developer Documentation Strategy (Recommended)

* Each class/interface has **JSDoc** explaining:

  * Purpose
  * Usage
  * Domain invariants
  * Chainable events
  * Hooks for adapters
* SPI registration, flows, attempts, proofs, sessions — **all documented**
* Link to external docs:

  * Passwordless installation guide
  * Adapter setup
  * Policy DSL examples
* Optional: `@link` in JSDoc for chainable navigation

---

## Step 9 Status

✅ Minimal end-to-end flow defined (Passwordless)
✅ Domain-only, infra-agnostic
✅ Traceable chain with chainable documentation
✅ Modular, tree-shakable, extensible

---

# Step 10 — Policy DSL Formalization

> Goal: Enable fully declarative policies for authentication, step-up, risk, and multi-factor flows.
> Policies must be **versionable, chainable, and traceable**.

---

## 1. Core Principles

* Policies are **data**, not logic.
* Evaluated by a domain service (e.g., `AuthenticationPolicyEvaluator`).
* Traceable: each policy evaluation leaves a chainable record.
* Extensible: new conditions, actions, or flows can be added without code change.
* Enterprise-ready: multi-tenant, step-up, conditional flows supported.

---

## 2. Policy Structure

```ts
interface AuthenticationPolicy {
  /**
   * Unique identifier
   */
  policyId: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Scope of the policy: global, flow, principal, method
   */
  scope: PolicyScope;

  /**
   * Ordered rules
   */
  rules: PolicyRule[];

  /**
   * Optional metadata for auditing
   */
  metadata?: Record<string, unknown>;
}
```

---

## 3. PolicyScope

```ts
type PolicyScope =
  | 'Global'
  | 'Principal'
  | 'AuthMethod'
  | 'AuthFlow'
  | 'Resource';
```

* Declarative scope ensures traceability.
* Policies applied to same subject are evaluated in order.

---

## 4. PolicyRule

```ts
interface PolicyRule {
  /**
   * Condition to evaluate
   */
  condition: ConditionExpression;

  /**
   * Action if condition is true
   */
  action: PolicyAction;

  /**
   * Optional reason for audit trail
   */
  reason?: string;
}
```

* Rules are **atomic**, traceable, and versionable.
* Reason field ensures **chainable audit logging**.

---

## 5. ConditionExpression

```ts
interface ConditionExpression {
  subject: string; // e.g., 'risk.score', 'device.trusted', 'principal.type'
  operator: Operator; // equals, notEquals, greaterThan, lessThan, in, notIn
  value: unknown; // domain-agnostic value
}
```

* Minimal, domain-agnostic
* Serializable
* Developers can trace which condition triggered which action

### Operators

```ts
type Operator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'in'
  | 'notIn';
```

---

## 6. PolicyAction

```ts
type PolicyAction =
  | { type: 'Allow' }
  | { type: 'Deny' }
  | { type: 'RequireStepUp'; requiredFactors: string[] }
  | { type: 'SelectFlow'; flowId: string }
  | { type: 'LimitTrustLevel'; level: TrustLevel };
```

* Fully declarative
* Chainable
* Traceable in logs
* Supports step-up, conditional flows, multi-factor, trust downgrades

---

## 7. Policy Evaluation Result

```ts
interface PolicyEvaluationResult {
  decision: 'Allow' | 'Deny' | 'StepUpRequired' | 'FlowSelected';
  triggeredRules: PolicyRule[];
  metadata?: Record<string, unknown>;
}
```

* All rules evaluated or short-circuited
* `triggeredRules` allows **audit trail chaining**
* Metadata includes reason, timestamp, and evaluation context

---

## 8. Policy Evaluation Flow (Abstract)

```ts
class AuthenticationPolicyEvaluator {
  async evaluate(
    context: AuthEvaluationContext,
    policies: AuthenticationPolicy[]
  ): Promise<PolicyEvaluationResult> {
    // Abstract: domain only
    // Implementations will run the rules, produce decision, and trigger events
  }
}
```

* `AuthEvaluationContext` includes attempt, session, principal, device, risk, etc.
* Result is **domain-only**, no infra logic.
* Each evaluation is **traceable, versionable, chainable**.

---

## 9. Example Policy (Passwordless Step-Up)

```ts
const highRiskStepUpPolicy: AuthenticationPolicy = {
  policyId: 'policy-001',
  name: 'High Risk Step-Up',
  scope: 'Global',
  rules: [
    {
      condition: { subject: 'risk.score', operator: 'greaterThan', value: 70 },
      action: { type: 'RequireStepUp', requiredFactors: ['otp'] },
      reason: 'High-risk login requires additional verification'
    }
  ]
};
```

* Traceable in logs (`policyId`, `reason`)
* Serializable for storage or audit
* Extensible for enterprise tenants

---

## 10. Multi-Rule & Flow Selection Example

```ts
const enterpriseFlowPolicy: AuthenticationPolicy = {
  policyId: 'policy-002',
  name: 'Enterprise Flow Selector',
  scope: 'Principal',
  rules: [
    {
      condition: { subject: 'principal.type', operator: 'equals', value: 'Service' },
      action: { type: 'SelectFlow', flowId: 'm2m_flow' },
      reason: 'Service accounts must use machine-to-machine flow'
    }
  ]
};
```

* Policies **do not execute flows**, just select them
* Chainable and auditable

---

## 11. Documentation & Traceability Rules

* Every policy and rule must have:

  * `policyId`
  * `reason`
  * Optional metadata linking to docs or JSDoc
* All evaluations **emit triggeredRules** → chainable audit trail
* Developers can **follow evaluation chain in code** and see exact reasoning

---

## 12. Extensibility Guarantees

* New operators: add to `Operator` enum
* New actions: extend `PolicyAction` union
* New condition subjects: extend `AuthEvaluationContext`
* All changes are **modular, traceable, and versionable**

---

## Step 10 Status

✅ Policy DSL formalized
✅ Declarative, auditable, traceable
✅ Enterprise-ready (step-up, multi-flow, trust-level)
✅ Chainable in code for developer reference

---

# Step 11 — Multi-Tenant / Enterprise Extension Model

> Goal: Enable the auth core to serve multiple tenants or enterprise clients with isolated configurations, policies, flows, and custom auth methods, without changing core domain.

---

## 1. Core Principles

* Each tenant can have **custom flows, policies, and auth methods**.
* Domain objects remain **tenant-agnostic**.
* Configuration is **composable**, versioned, and auditable.
* No core domain changes required for new tenants.
* Traceable: every domain object records **tenant context**.

---

## 2. Tenant Context (Value Object)

```ts
interface TenantContext {
  tenantId: string;
  name?: string;
  metadata?: Record<string, unknown>;
}
```

* Attached to **Principal, AuthenticationAttempt, AuthenticationSession, Policy evaluation**.
* Provides **traceable chain** of which tenant a domain object belongs to.
* Supports **multi-tenant logging and auditing**.

---

## 3. Tenant-Specific Flows

* Flows can be defined **per tenant**.
* Example:

```ts
const tenantFlow = new AuthenticationFlow({
  flowId: 'enterprise_passwordless',
  tenantId: 'tenant-123',
  name: 'Enterprise Passwordless Flow',
  steps: [
    { stepId: 'email_link_step', authMethodType: 'passwordless_email', required: true }
  ]
});
```

* `tenantId` ensures flows are isolated.
* Developers can **trace flows by tenant**.

---

## 4. Tenant-Specific Policies

* Policies are scoped per tenant.
* Example:

```ts
const enterprisePolicy: AuthenticationPolicy = {
  policyId: 'policy-tenant-001',
  name: 'Tenant 123 MFA Policy',
  scope: 'Principal',
  rules: [
    {
      condition: { subject: 'risk.score', operator: 'greaterThan', value: 50 },
      action: { type: 'RequireStepUp', requiredFactors: ['otp'] },
      reason: 'Tenant requires additional verification for medium-risk logins'
    }
  ],
  metadata: { tenantId: 'tenant-123' }
};
```

* Policies are **versioned** and **audit-traceable** per tenant.
* Chainable evaluation ensures **who read/triggered each policy** is recorded.

---

## 5. Tenant-Specific Auth Methods

* Methods can be **enabled or disabled per tenant**.
* Registration API supports tenant-scoping:

```ts
tenantRegistry.register('tenant-123', passwordlessMethod);
```

* Core domain sees only abstract `IAuthMethod`.
* Tree-shakable: uninstalled methods do not affect bundle size.

---

## 6. Tenant-Specific Credential Configuration

* Credential lifecycles can be configured per tenant:

  * Expiration time
  * Rotation rules
  * Step-up requirements
* Credentials remain domain-agnostic; tenant-specific behavior enforced via policies and adapters.

---

## 7. Tenant Context in AuthenticationAttempt

* Attach `tenantId` to each attempt:

```ts
const attempt = AuthenticationAttempt.create({
  flowId: 'enterprise_passwordless',
  principalId: 'user-456',
  tenantId: 'tenant-123'
});
```

* Ensures **flow, policies, session, and proofs** are evaluated within tenant scope.
* Supports **audit and traceability** across multi-tenant systems.

---

## 8. Tenant Context in AuthenticationSession

* Session includes tenant metadata:

```ts
const session = AuthenticationSession.createFromAttempt(attempt, {
  trustLevel: 'Medium',
  tenantContext: { tenantId: 'tenant-123' }
});
```

* Downstream authorization can enforce **tenant isolation**.
* Chainable: developers can trace session → attempt → tenant.

---

## 9. Extensibility & Overrides

* Tenants can:

  * Add custom flows
  * Override default policies
  * Enable/disable auth methods
  * Adjust trust-level rules
* Core domain is **unchanged**.
* Chainable documentation ensures each override is traceable.

---

## 10. Multi-Tenant Repository Pattern

```ts
interface TenantAwareRepository<T> {
  findByTenant(tenantId: string, id: string): Promise<T | null>;
  saveForTenant(tenantId: string, entity: T): Promise<void>;
}
```

* Ensures **tenant isolation at domain level**.
* Infrastructure handles actual storage, domain only sees tenant-scoped interfaces.

---

## 11. Audit and Traceability

* Every domain event, policy evaluation, session creation, or flow execution:

  * Includes `tenantId`
  * Includes `principalId`
  * Optional metadata for chainable docs or code references
* Developers reading code can follow **exact tenant-specific logic**.

---

## 12. Step 11 Status

✅ Multi-tenant support defined
✅ Tenant-scoped flows, policies, auth methods, sessions, attempts
✅ Chainable, traceable for audit
✅ Core domain remains tenant-agnostic
✅ Enterprise-ready, tree-shakable, modular

---

# Step 12 — Additional AuthMethod Implementations (Abstract)

> Goal: Provide modular contracts and structure for common auth methods beyond Passwordless, ensuring traceability, enterprise readiness, and minimal bundle size.

---

## 1. Module Layout

```
@auth/method-otp
@auth/method-oauth
@auth/method-passkey
```

* Each package is **optional**.
* Depends only on:

  * `@auth/core-domain`
  * `@auth/core-ports`
* Does **not depend** on other methods or adapters.

---

## 2. OTP Method (Abstract)

### Purpose

* One-time codes delivered via email, SMS, or push.
* Supports **step-up, MFA, or primary auth**.

### SPI Skeleton

```ts
export interface IOtpMethod extends IAuthMethod<{ destination: string }, AuthProof> {
  /**
   * Generate and issue OTP challenge
   */
  issueChallenge(context: AuthContext, options?: { length?: number; ttl?: number }): Promise<Challenge>;

  /**
   * Verify OTP response
   */
  verifyChallenge(response: ChallengeResponse, context: AuthContext): Promise<AuthProof>;
}
```

**Documentation Notes:**

* `destination` is transport-agnostic.
* Challenge and proof remain domain-pure.
* Developers can trace OTP flow from attempt → challenge → proof → session.

---

## 3. OAuth Method (Abstract)

### Purpose

* Delegated authentication via third-party providers (Google, Azure, etc.)
* Supports SSO and enterprise logins.

### SPI Skeleton

```ts
export interface IOAuthMethod extends IAuthMethod<{ code: string; provider: string }, AuthProof> {
  /**
   * Initiate OAuth authorization
   */
  initiateAuth(context: AuthContext, provider: string): Promise<string>; // URL to redirect

  /**
   * Complete OAuth authentication with provider code
   */
  completeAuth(code: string, context: AuthContext): Promise<AuthProof>;
}
```

**Documentation Notes:**

* Domain sees only `AuthProof`.
* No HTTP or token parsing in domain.
* Chainable: principal → attempt → proof → session → policy evaluation.

---

## 4. Passkey / WebAuthn Method (Abstract)

### Purpose

* Hardware-backed or platform credentials (biometrics, security keys)
* Supports phishing-resistant enterprise login

### SPI Skeleton

```ts
export interface IPasskeyMethod extends IAuthMethod<{ clientData: unknown }, AuthProof> {
  /**
   * Initiate passkey registration or authentication
   */
  initiate(context: AuthContext, options?: { type: 'register' | 'authenticate' }): Promise<Challenge>;

  /**
   * Verify passkey response
   */
  verify(response: ChallengeResponse, context: AuthContext): Promise<AuthProof>;
}
```

**Documentation Notes:**

* `clientData` is abstracted; adapter handles platform specifics.
* Challenge/proof remain domain-pure.
* Developers can trace registration/authentication per attempt.

---

## 5. Common Principles Across Methods

* Tree-shakable: install only the methods you need.
* Domain-agnostic: all proofs and challenges are abstractions.
* Chainable: attempts, proofs, sessions, and policies are auditable.
* Extensible: adding new methods requires only a new package implementing `IAuthMethod`.

---

## 6. Method Registration (Example)

```ts
const registry = new AuthMethodRegistry();
registry.register(otpMethod);         // @auth/method-otp
registry.register(oauthMethod);       // @auth/method-oauth
registry.register(passkeyMethod);     // @auth/method-passkey
```

* Explicit registration ensures **tree-shakability**.
* Developers can trace **which methods are enabled per tenant or flow**.

---

## 7. Step 12 Status

✅ Additional auth methods abstracted
✅ OTP, OAuth, Passkey supported
✅ Modular, optional, installable separately
✅ Traceable chain from attempt → proof → session → policy
✅ Enterprise-ready, extensible, tree-shakable

---

# Step 13 — Adapter Implementation Guides

> Goal: Provide a **modular, optional, and tree-shakable** adapter structure for storage, token management, and transport layers.

---

## 1. Adapter Principles

* Implements **ports defined in `@auth/core-ports`**.
* Tree-shakable: install only what you need.
* Fully replaceable: e.g., Postgres ↔ Redis ↔ Memory.
* Modular: one adapter per concern.
* Traceable: every adapter operation can emit domain events or logs for auditing.

---

## 2. Adapter Package Layout

```
@auth/adapter-memory        ← in-memory demo & tests
@auth/adapter-postgres      ← persistence
@auth/adapter-redis         ← caching / OTP / session storage
@auth/adapter-jwt           ← token issuance / verification
@auth/adapter-oidc          ← external SSO / OIDC provider
@auth/adapter-http-express  ← HTTP integration
@auth/adapter-http-hono     ← alternative HTTP framework
```

* Each package is optional.
* Depends only on `@auth/core-ports`.
* No cross-dependencies.

---

## 3. Persistence Adapters

### 3.1 Credential Repository Adapter

```ts
export interface CredentialRepositoryAdapter extends CredentialRepository {
  // Adapter-specific configuration (Postgres table, Redis hash, etc.)
}
```

**Documentation Notes:**

* Must implement domain interface `CredentialRepository`.
* Domain only sees abstract operations:

  * save()
  * findById()
  * revoke()
* Storage details hidden in adapter.
* Traceable via adapter logs or emitted events.

---

### 3.2 Principal / Session / Attempt Repositories

* Same pattern: implement `PrincipalRepository`, `AuthenticationSessionRepository`, `AuthenticationAttemptRepository`.
* Example adapter: `PostgresPrincipalRepositoryAdapter`.
* Optional: emit domain events for auditing.

---

## 4. Token Adapters

### 4.1 JWT Adapter

```ts
export interface JwtAdapter extends SessionRepresentationFactory {
  issue(session: AuthenticationSession, options?: JwtOptions): Promise<string>;
  verify(token: string): Promise<AuthProof>;
}
```

* Purely optional.
* Domain never depends on JWT format.
* Traceable: JWT issuance linked to sessionId → tenantId.

---

### 4.2 OIDC / OAuth Adapter

```ts
export interface OidcAdapter extends IOAuthMethod {
  initiateAuth(context: AuthContext, provider: string): Promise<string>;
  completeAuth(code: string, context: AuthContext): Promise<AuthProof>;
}
```

* Adapter handles HTTP redirect, code exchange.
* Domain sees only `AuthProof`.
* Traceable through context and tenant metadata.

---

## 5. Caching / Temporary Storage Adapters

* OTP codes, challenge states, rate limiting.
* Interface: implement `ChallengeStore` or `CredentialMaterialStore`.
* Example: `RedisOtpAdapter`, `MemoryOtpAdapter`.
* Modular: can swap infra without affecting domain.

---

## 6. HTTP Adapters

* Optional transport layer integration: Express, Hono, Fastify.
* Implement endpoint wiring:

  * Receive request
  * Call registered auth method
  * Return proof/session
* Domain remains **transport-agnostic**.

---

## 7. Adapter Best Practices

1. **Install separately** — don’t bundle with core.
2. **No domain logic** — only map ports → infra.
3. **Emit events** for auditing / tracing.
4. **Configurable per tenant** — adapter can read tenant-specific metadata.
5. **Tree-shakable** — unused adapters never included in bundle.
6. **Traceable code links** — each adapter operation references domain events or JSDoc for auditing.

---

## 8. Adapter Documentation Strategy

* Each adapter includes:

  * JSDoc explaining mapping to ports
  * Tenant-aware behavior
  * Optional emitted events for traceability
  * Usage example (tree-shakable)
* Chainable: core-domain → port → adapter → infra action
* Developers can trace **who read / executed** each operation.

---

## Step 13 Status

✅ Adapter types and patterns defined
✅ Storage, caching, tokens, HTTP, OIDC, JWT covered
✅ Modular, tree-shakable, optional
✅ Traceable chain from domain → port → adapter
✅ Enterprise-ready and multi-tenant safe

---

# Step 14 — End-to-End Modular Integration Examples

> Goal: Show how to wire **core-domain, core-ports, methods, adapters, policies, and multi-tenant context** together in a modular, traceable, and enterprise-ready way.

---

## 1. Installable Modules

```
@auth/core-domain
@auth/core-ports
@auth/method-passwordless
@auth/method-otp
@auth/method-oauth
@auth/adapter-memory
@auth/adapter-jwt
```

* Each module optional
* Installed only if needed → tree-shakable

---

## 2. Tenant Setup

```ts
const tenant: TenantContext = { tenantId: 'tenant-123', name: 'Acme Corp' };
```

* All subsequent flows, policies, and sessions are **scoped to tenant**
* Chainable: attempt → session → policy → tenant

---

## 3. AuthMethod Registration per Tenant

```ts
const registry = new AuthMethodRegistry();

registry.registerForTenant(tenant.tenantId, passwordlessMethod);
registry.registerForTenant(tenant.tenantId, otpMethod);
registry.registerForTenant(tenant.tenantId, oauthMethod);
```

* Tree-shakable: unused methods not included
* Traceable: registry logs tenant + methodType

---

## 4. Authentication Flow Setup

```ts
const flow = new AuthenticationFlow({
  flowId: 'enterprise_flow',
  tenantId: tenant.tenantId,
  name: 'Enterprise Multi-Method Flow',
  steps: [
    { stepId: 'passwordless_step', authMethodType: 'passwordless_email', required: true },
    { stepId: 'otp_step', authMethodType: 'otp', required: false }
  ]
});
```

* Steps refer to registered methods
* Flow scoped per tenant
* Chainable: each step → proof → policy evaluation

---

## 5. Policy Setup per Tenant

```ts
const policy: AuthenticationPolicy = {
  policyId: 'policy-tenant-001',
  name: 'Step-Up for High-Risk Logins',
  scope: 'Principal',
  rules: [
    {
      condition: { subject: 'risk.score', operator: 'greaterThan', value: 70 },
      action: { type: 'RequireStepUp', requiredFactors: ['otp'] },
      reason: 'High-risk logins require OTP'
    }
  ],
  metadata: { tenantId: tenant.tenantId }
};
```

* Policies applied **before or after each step**
* Chainable evaluation logged for traceability

---

## 6. Authentication Attempt & Execution

```ts
const principal = Principal.create({ id: 'user-001', tenantId: tenant.tenantId });
const attempt = AuthenticationAttempt.create({ flowId: flow.flowId, principalId: principal.id, tenantId: tenant.tenantId });

// Execute passwordless step
const passwordlessProof = await passwordlessMethod.authenticate({ email: 'user@example.com' }, { principalId: principal.id, attemptId: attempt.id });

// Update attempt
attempt.completeStep(passwordlessProof);

// Evaluate policy after step
const policyResult = await policyEvaluator.evaluate({ attempt, session: null, context: { tenantId: tenant.tenantId } }, [policy]);
```

* Domain-only, infra-agnostic
* Proof → session → policy evaluation chain traceable
* Developers can see **full execution path** for audit

---

## 7. Session Creation

```ts
const session = AuthenticationSession.createFromAttempt(attempt, {
  trustLevel: 'Medium',
  tenantContext: tenant
});
```

* Captures **tenant, principal, flow, steps, proofs**
* Immutable ContextSnapshot stored
* Domain-pure, transport-agnostic

---

## 8. Adapter Wiring Example

```ts
const credentialRepo = new MemoryCredentialRepositoryAdapter();
const sessionRepo = new MemoryAuthenticationSessionRepositoryAdapter();
const jwtAdapter = new JwtAdapter({ secret: 'dummy' });

// Connect adapters to ports
// Domain only interacts with repositories via core-ports interfaces
```

* Tree-shakable: only installed adapters included
* Modular: can swap Postgres / Redis / JWT
* Traceable: all actions reference tenant + attempt + session

---

## 9. Chainable Audit Trail

```
Tenant -> Principal -> AuthenticationAttempt -> AuthMethod Step -> Proof -> Session -> Policy Evaluation -> Adapter Event
```

* Every step **documented with JSDoc**
* Events or logs link **who executed / evaluated**
* Developers can trace **full end-to-end path** without touching infra

---

## 10. Developer Documentation Strategy

* Use **JSDoc** for:

  * Modules
  * SPI methods
  * Flows and steps
  * Policy evaluation
  * Tenant context
  * Adapter mapping
* Include `@link` to related domain objects
* Chainable audit references included for every step

---

## Step 14 Status

✅ Full modular integration example complete
✅ Multi-tenant, multi-method, policy-driven
✅ Tree-shakable and modular
✅ Domain-only traceable chain
✅ Enterprise-ready

---
