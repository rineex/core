# @rineex/decision-engine

A framework-independent engine for evaluating candidates against constraints,
features, normalization, scoring, ranking, and selection rules.

## Installation

```sh
pnpm add @rineex/decision-engine
```

## Usage

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

const engine = new DecisionEngine(new DefaultDecisionValidator());

const execution = engine.execute(
  {
    id: 'supplier-selection',
    version: 'v1',
    candidateRefResolver: { resolve: candidate => candidate.id },
    constraints: [],
    features: [
      {
        key: 'quality',
        objective: FeatureObjective.MAXIMIZE,
        evaluate: candidate => ({
          key: 'quality',
          objective: FeatureObjective.MAXIMIZE,
          rawValue: candidate.quality,
        }),
      },
    ],
    normalizer: new MinMaxNormalizer(),
    scoringStrategy: new WeightedSumScoringStrategy({ resolve: () => 1 }),
    rankingStrategy: new DescendingScoreRankingStrategy(),
    selectionStrategy: new SelectTopNStrategy(1),
  },
  {
    candidates: suppliers,
    context: undefined,
    policy: { id: 'default', version: 'v1', values: {} },
  },
);
```

`execute` is synchronous and creates result and domain-event data only. Use
`InMemoryDecisionEventPublisher` or another `DecisionEventPublisher` adapter to
deliver the returned events outside the engine.
