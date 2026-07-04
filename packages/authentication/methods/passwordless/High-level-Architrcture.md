# Passwordless — High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Service Layer                  │
├─────────────────────────────────────────────────────────────┤
│  IssuePasswordlessChallengeService                          │
│  VerifyPasswordlessChallengeService                         │
│  • Orchestrate aggregate                                    │
│  • Coordinate ports                                         │
│  • Return Result<T, E> (v5 API: Result.err, not Result.fail) │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PasswordlessChallengeAggregate                 │
│  issue() · verify() · isExpired() · matchesSecret()          │
│  Events: Issued · Verified                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│ Ports               │           │ Value Objects        │
├─────────────────────┤           ├─────────────────────┤
│ PasswordlessChallenge│           │ PasswordlessChallengeId│
│   Repository        │           │ PasswordlessChannel    │
│ PasswordlessId      │           │ ChallengeDestination   │
│   GeneratorPort     │           │ ChallengeSecret        │
│ PasswordlessChannel │           │ PasswordlessChallenge  │
│   Port              │           │   Status               │
│ ClockPort (@rineex/ │           │ OtpCode                │
│   ddd)              │           └─────────────────────┘
└──────────┬──────────┘
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure (consumer-provided)                          │
│ DB repository · Clock adapter · Email/SMS/Push channels     │
└─────────────────────────────────────────────────────────────┘
```

## Integration note

Passwordless is **not** on `AuthMethodPort` yet. OTP uses the port; passwordless
uses standalone services. See `@rineex/auth-core` GAP_ANALYSIS.md.
