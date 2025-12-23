# Auth Core — Domain Foundations (DDD + Hexagonal)

## 1. Purpose

Design a **framework-agnostic, storage-agnostic authentication core** that:

- Works with **zero customization**
- Supports **incremental auth methods**
- Is suitable for **enterprise and simple products**
- Is extensible without modifying existing domain code
- Is independent of HTTP, DB, tokens, providers, or frameworks

This module defines **what authentication is**, not **how it is transported or
stored**.

---

## 2. Architectural Constraints (Hard Rules)

These rules must never be violated:

1. Authentication is **not identity**
2. Authentication methods are **plugins**
3. Authentication flows are **data-driven**
4. Infrastructure choices are **external**
5. Domain owns **rules and invariants only**
6. No provider, protocol, or framework knowledge in domain
7. No auth method may require changing existing aggregates

If a new auth method breaks a rule → architecture is wrong.

---

## 3. Bounded Context

### Authentication Context (this module)

Responsibilities:

- Verifying proof of access
- Orchestrating authentication flows
- Enforcing policies
- Producing authenticated sessions

Non-responsibilities:

- User profile management
- Authorization / permissions
- HTTP handling
- UI flows
- Token formats
- Database schemas

---

## 4. Ubiquitous Language (Canonical)

These terms have **single meanings** and must not be overloaded:

| Term         | Meaning                                         |
| ------------ | ----------------------------------------------- |
| Principal    | Any actor that can authenticate                 |
| Credential   | Authentication material owned by a principal    |
| Auth Factor  | Category of proof (knowledge, possession, etc.) |
| Auth Method  | Concrete mechanism (password, otp, oauth, …)    |
| Auth Attempt | One authentication execution                    |
| Auth Flow    | Orchestration rules                             |
| Auth Policy  | Constraints and conditions                      |
| Auth Proof   | Verifiable evidence                             |
| Auth Result  | Outcome of authentication                       |
| Session      | Post-auth continuity                            |

---

## 5. Core Domain Aggregates

### 5.1 Principal (Aggregate Root)

Represents **who or what** is authenticating.

**Key rules**

- Can exist without credentials
- Can represent humans, services, or devices
- Is auth-method agnostic

---

### 5.2 Credential (Entity)

Represents **what the principal owns** to authenticate.

**Key rules**

- Domain never stores secrets
- Lifecycle is domain-controlled
- Verification is delegated to infrastructure

---

### 5.3 AuthenticationAttempt (Aggregate Root)

Represents **one authentication process**.

**Why it exists**

- Prevents replay
- Supports MFA and step-up
- Enables audit and risk evaluation

---

### 5.4 AuthenticationSession (Aggregate Root)

Represents **authenticated continuity**.

**Key rules**

- Created only after successful authentication
- Stateless vs stateful is infrastructure choice
- Trust level is domain-owned

---

## 6. Value Objects (Core Concepts)

Value Objects define meaning, not storage:

- AuthMethodType
- AuthFactorType
- AuthProof
- TrustLevel
- RiskScore
- Challenge
- ContextSnapshot

Auth factors are **categories**, not implementations:

- Knowledge
- Possession
- Inherence
- Delegated

---

## 7. Authentication Methods (Extensibility Model)

Authentication methods are **not services** and **not branches**.

They are **capabilities described by data**.

An Auth Method defines:

- Its identifier
- Supported factors
- Required inputs
- Output proof type

The domain:

- Does not know _how_ a method works
- Does not know _who_ provides it
- Does not change when a method is added

---

## 8. Domain Services (Pure Logic)

### Authentication Orchestrator

Coordinates attempts, proofs, and policies.

### Policy Evaluator

Decides:

- Whether authentication is allowed
- Whether step-up is required
- Which flow applies

No domain service:

- Talks to HTTP
- Knows about tokens
- Knows about databases

---

## 9. Hexagonal Ports (Boundaries)

### Persistence Ports

- PrincipalRepository
- CredentialRepository
- AuthenticationAttemptRepository
- AuthenticationSessionRepository

### Capability Ports

- AuthProofVerifier
- ChallengeIssuer
- RiskEvaluator
- TokenIssuer

Infrastructure implements ports. Domain only defines **contracts**.

---

## 10. Phase 1 Auth Methods (Initial Scope)

Start small, cover most use cases:

1. Password (compatibility)
2. Passwordless (email magic)
3. OTP (TOTP + Email)
4. OAuth2 / OIDC
5. Social Login
6. API Tokens (M2M)

Everything else is additive.

---

## 11. Explicit Non-Goals (For Now)

These are **intentionally excluded**:

- HTTP redirects
- Cookies and headers
- JWT structure
- OAuth provider SDKs
- UI workflows
- Database schemas

They belong to adapters, not the core.

---

## 12. Extensibility Guarantees

Before adding any auth feature, verify:

- No existing aggregate changes
- No domain branching
- No infrastructure assumptions
- No HTTP dependency
- Enabled via configuration or policy

Failing any → redesign first.

---

## 13. Document Status

- This document is **authoritative**
- Any implementation must conform to it
- Changes require architectural justification
