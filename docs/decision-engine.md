# Decision engine

`@rineex/decision-engine` is a deterministic, synchronous pipeline for choosing
candidates. It has no persistence, I/O, logging, or implicit event dispatch;
callers own those concerns.

## Execution model

1. Validate the definition and request.
2. Evaluate every hard constraint.
3. Extract features for eligible candidates.
4. Normalize feature values, score candidates, and rank them.
5. Select the final ranked candidates.
6. Return frozen evaluations, a result, and `candidate.rejected` /
   `decision.completed` events.

Constraints explain ineligibility. Features are numeric preferences with
`FeatureObjective.MAXIMIZE` or `FeatureObjective.MINIMIZE`. A policy provides
the weights or other business values used by strategies.

## Example

```ts
import {
  DecisionEngine,
  DefaultDecisionValidator,
  DescendingScoreRankingStrategy,
  type DecisionPolicy,
  FeatureObjective,
  MinMaxNormalizer,
  SelectTopNStrategy,
  WeightedSumScoringStrategy,
} from '@rineex/decision-engine';

type Supplier = {
  id: string;
  cost: number;
  quality: number;
  approved: boolean;
};
type Policy = DecisionPolicy & {
  values: {
    qualityWeight: number;
    costWeight: number;
  };
};

const definition = {
  id: 'supplier-selection',
  version: 'v1',
  candidateRefResolver: { resolve: (supplier: Supplier) => supplier.id },
  constraints: [
    {
      id: 'approved',
      evaluate: (supplier: Supplier) =>
        supplier.approved
          ? { constraintId: 'approved', satisfied: true as const }
          : {
              constraintId: 'approved',
              satisfied: false as const,
              reasonCode: 'NOT_APPROVED',
            },
    },
  ],
  features: [
    {
      key: 'quality',
      objective: FeatureObjective.MAXIMIZE,
      evaluate: (supplier: Supplier) => ({
        key: 'quality',
        objective: FeatureObjective.MAXIMIZE,
        rawValue: supplier.quality,
      }),
    },
    {
      key: 'cost',
      objective: FeatureObjective.MINIMIZE,
      evaluate: (supplier: Supplier) => ({
        key: 'cost',
        objective: FeatureObjective.MINIMIZE,
        rawValue: supplier.cost,
      }),
    },
  ],
  normalizer: new MinMaxNormalizer(),
  scoringStrategy: new WeightedSumScoringStrategy<Policy>({
    resolve: (key, policy) =>
      key === 'quality'
        ? policy.values.qualityWeight
        : policy.values.costWeight,
  }),
  rankingStrategy: new DescendingScoreRankingStrategy(),
  selectionStrategy: new SelectTopNStrategy(1),
};

const execution = new DecisionEngine(new DefaultDecisionValidator()).execute(
  definition,
  {
    candidates: [
      { id: 'low-cost', quality: 60, cost: 10, approved: true },
      { id: 'high-quality', quality: 100, cost: 90, approved: true },
    ],
    context: undefined,
    policy: {
      id: 'default',
      version: 'v1',
      values: { qualityWeight: 0.75, costWeight: 0.25 },
    },
  },
);

console.log(execution.result.selected);
```

Use `InMemoryDecisionEventPublisher` only when an in-memory ordered dispatcher
fits the application. The engine itself merely returns events; publish them
after a successful execution boundary.
