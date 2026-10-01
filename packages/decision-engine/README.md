# @rineex/decision-engine

A framework-independent, synchronous engine for making explainable selections
from a set of candidates. It evaluates hard constraints, normalizes feature
values, scores and ranks eligible candidates, selects a final subset, and
returns the complete decision trail plus domain events.

## Installation

```sh
pnpm add @rineex/decision-engine
```

## Quick start

```ts
import {
  DecisionEngine,
  DefaultDecisionValidator,
  DescendingScoreRankingStrategy,
  FeatureObjective,
  MinMaxNormalizer,
  SelectTopNStrategy,
  WeightedSumScoringStrategy,
} from '@rineex/decision-engine';

interface Supplier {
  readonly id: string;
  readonly approved: boolean;
  readonly quality: number;
  readonly cost: number;
}

const suppliers: readonly Supplier[] = [
  { id: 'acme', approved: true, quality: 98, cost: 125 },
  { id: 'beta', approved: true, quality: 80, cost: 80 },
  { id: 'blocked', approved: false, quality: 95, cost: 70 },
];

const engine = new DecisionEngine(new DefaultDecisionValidator());

const execution = engine.execute(
  {
    id: 'supplier-selection',
    version: 'v1',
    candidateRefResolver: { resolve: candidate => candidate.id },
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
      resolve: key => (key === 'quality' ? 0.7 : 0.3),
    }),
    rankingStrategy: new DescendingScoreRankingStrategy(),
    selectionStrategy: new SelectTopNStrategy(1),
  },
  {
    candidates: suppliers,
    context: undefined,
    policy: { id: 'default', version: 'v1', values: {} },
  },
);

console.log(
  execution.result.selected.map(evaluation => evaluation.candidate.id),
);
// ['acme']
```

## Execution model

`execute` is synchronous and has no I/O. It performs these stages in order:

1. Validate the definition and request.
2. Resolve and validate unique candidate references.
3. Evaluate hard constraints for every candidate.
4. Extract, normalize, score, rank, and select eligible candidates.
5. Return immutable result data and events.

Rejected candidates are retained in `result.evaluations` with their constraint
results, but have no features, score, rank, or selection flag. This makes the
outcome explainable without re-running the decision.

## Built-in strategies

| Component                             | Purpose                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `MinMaxNormalizer`                    | Maps each feature across eligible candidates to `0..1`; minimize objectives are inverted and zero-range features become `1`. |
| `WeightedSumScoringStrategy`          | Multiplies each normalized feature by a policy-derived finite weight.                                                        |
| `DescendingScoreRankingStrategy`      | Ranks higher scores first while preserving input order for ties.                                                             |
| `SelectFirstStrategy`                 | Selects the highest-ranked candidate.                                                                                        |
| `SelectTopNStrategy(n)`               | Selects up to `n` ranked candidates.                                                                                         |
| `SelectAboveThresholdStrategy(score)` | Selects ranked candidates at or above the score threshold.                                                                   |

## Results and events

`execution.result` contains the selected evaluations and every candidate
evaluation. `execution.events` includes one `candidate.rejected` event for each
rejected candidate and one `decision.completed` event. Output collections and
engine-owned records are frozen; supplied candidate objects are not modified.

The engine creates events but never delivers them. Publish them explicitly at
your application boundary:

```ts
import {
  type DecisionCompletedEvent,
  InMemoryDecisionEventPublisher,
} from '@rineex/decision-engine';

const publisher = new InMemoryDecisionEventPublisher();
publisher.subscribe<DecisionCompletedEvent>('decision.completed', {
  handle: async event => {
    console.log(event.payload.selectedCandidateRefs);
  },
});

await publisher.publish(execution.events);
```

## Errors

Invalid definitions throw `InvalidDecisionDefinitionError`. Invalid runtime
input or failed component execution throws `DecisionExecutionError`. Both extend
`DecisionError` and expose a stable `code`, structured `details`, and the
original `cause` when available.
