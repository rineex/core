# Decision engine

`@rineex/decision-engine` is a framework-independent, deterministic, synchronous
decision pipeline. Give it a reusable definition and one runtime request; it
returns an immutable decision result and the events that describe the completed
decision. It never performs I/O, persistence, logging, telemetry, or event
publication.

## Install

```bash
pnpm add @rineex/decision-engine
```

## Mental model

A definition is the reusable algorithm. A request contains a specific candidate
set, context, policy, and optional correlation ID. The policy is versioned so
completed decisions can be audited and reproduced.

```text
definition + request
  → validate
  → constraints (all candidates)
  → features (eligible candidates only)
  → normalize
  → score
  → rank
  → select
  → immutable result + domain events
```

Constraints are hard eligibility rules. A failed constraint does not stop
evaluation of the remaining constraints: the output preserves every failure for
explainability. Features are numeric preferences. Their objective declares
whether larger (`MAXIMIZE`) or smaller (`MINIMIZE`) raw values are better.

## Complete example

```ts
import {
  DecisionEngine,
  DefaultDecisionValidator,
  DescendingScoreRankingStrategy,
  type DecisionDefinition,
  type DecisionPolicy,
  FeatureObjective,
  InMemoryDecisionEventPublisher,
  MinMaxNormalizer,
  SelectTopNStrategy,
  WeightedSumScoringStrategy,
} from '@rineex/decision-engine';

type Supplier = {
  readonly id: string;
  readonly cost: number;
  readonly quality: number;
  readonly approved: boolean;
};

interface SupplierPolicy extends DecisionPolicy {
  readonly values: {
    readonly qualityWeight: number;
    readonly costWeight: number;
  };
}

const definition: DecisionDefinition<Supplier, undefined, SupplierPolicy> = {
  id: 'supplier-selection',
  version: 'v1',
  candidateRefResolver: { resolve: supplier => supplier.id },
  constraints: [
    {
      id: 'approved',
      evaluate: supplier =>
        supplier.approved
          ? { constraintId: 'approved', satisfied: true }
          : {
              constraintId: 'approved',
              satisfied: false,
              reasonCode: 'NOT_APPROVED',
            },
    },
  ],
  features: [
    {
      key: 'quality',
      objective: FeatureObjective.MAXIMIZE,
      evaluate: supplier => ({
        key: 'quality',
        objective: FeatureObjective.MAXIMIZE,
        rawValue: supplier.quality,
      }),
    },
    {
      key: 'cost',
      objective: FeatureObjective.MINIMIZE,
      evaluate: supplier => ({
        key: 'cost',
        objective: FeatureObjective.MINIMIZE,
        rawValue: supplier.cost,
      }),
    },
  ],
  normalizer: new MinMaxNormalizer(),
  scoringStrategy: new WeightedSumScoringStrategy({
    resolve: (key, policy) =>
      key === 'quality'
        ? policy.values.qualityWeight
        : policy.values.costWeight,
  }),
  rankingStrategy: new DescendingScoreRankingStrategy(),
  selectionStrategy: new SelectTopNStrategy(1),
};

const engine = new DecisionEngine(new DefaultDecisionValidator());
const execution = engine.execute(definition, {
  candidates: [
    { id: 'low-cost', quality: 60, cost: 10, approved: true },
    { id: 'high-quality', quality: 100, cost: 90, approved: true },
    { id: 'unapproved', quality: 99, cost: 20, approved: false },
  ],
  context: undefined,
  policy: {
    id: 'default',
    version: 'v1',
    values: { qualityWeight: 0.75, costWeight: 0.25 },
  },
  correlationId: 'supplier-request-42',
});

console.log(execution.result.selected);
console.log(execution.events);

const publisher = new InMemoryDecisionEventPublisher();
publisher.subscribe('decision.completed', {
  handle: async event => console.log(event.payload.selectedCandidateRefs),
});
await publisher.publish(execution.events);
```

## Definition contract

| Field                  | Requirement                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| `id`, `version`        | non-blank stable identifiers                                                 |
| `candidateRefResolver` | resolves a non-blank, unique reference for each candidate                    |
| `constraints`          | deterministic eligibility rules; results must use the declared constraint ID |
| `features`             | deterministic numeric measurements; feature keys must be stable and unique   |
| `normalizer`           | preserves the configured feature set and produces valid normalized values    |
| `scoringStrategy`      | returns a finite score                                                       |
| `rankingStrategy`      | produces a valid ranking over eligible candidates                            |
| `selectionStrategy`    | returns only candidates from the ranked eligible set                         |

`DefaultDecisionValidator` checks the definition and request before processing.
The engine then validates runtime outputs from every collaborator. Invalid
candidate references, non-finite raw values or scores, feature-set changes, and
selections outside the ranked set cause an `InvalidDecisionDefinitionError` or
`DecisionExecutionError`.

## Built-in strategies

`MinMaxNormalizer` maps feature values to a comparable range and honors their
objective. When every raw value for a feature is equal, it normalizes that
feature to `1` for all eligible candidates.

`WeightedSumScoringStrategy` asks a `FeatureWeightResolver` for each feature
weight and sums normalized value × weight. Weights must be finite.
`DescendingScoreRankingStrategy` ranks highest scores first and preserves input
order for ties.

Choose selection by outcome:

```ts
new SelectFirstStrategy();
new SelectTopNStrategy(3); // positive safe integer only
new SelectAboveThresholdStrategy(0.8); // finite threshold only
```

All built-in selectors require already ranked, eligible evaluations.
`SelectAboveThresholdStrategy` requires finite candidate scores.

## Result and events

`execution.result` includes definition and policy IDs/versions, optional
correlation ID, every evaluation, and the selected subset ordered by rank. Each
`CandidateEvaluation` contains constraint results, eligibility, feature values,
optional score/rank, and `selected` status.

The engine emits, in order:

1. One `candidate.rejected` event per ineligible candidate, including its
   reference and failed constraints.
2. One `decision.completed` event, including candidate, eligible, and rejected
   counts plus selected references.

The result, evaluations, features, events, and execution container are frozen
before return. Treat the output as a decision record, not a mutable working
object. Publish events only after the appropriate application transaction or
persistence boundary succeeds.

## Extension points

Implement `Constraint`, `Feature`, `Normalizer`, `ScoringStrategy`,
`RankingStrategy`, or `SelectionStrategy` for custom behavior. Keep
implementations deterministic and side-effect free. Put HTTP calls, database
access, random input, time acquisition, and message publication outside the
engine; pass those facts into the typed request context or policy first.
