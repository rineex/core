# @rineex/decision-engine

A deterministic, synchronous decision pipeline that evaluates constraints,
normalizes features, scores, ranks, selects, and returns frozen results and
domain events. It does no I/O or event publication.

```bash
pnpm add @rineex/decision-engine
```

Built-ins include `MinMaxNormalizer`, `WeightedSumScoringStrategy`,
`DescendingScoreRankingStrategy`, and first/top-N/threshold selection
strategies. Use `InMemoryDecisionEventPublisher` outside the engine when an
in-memory dispatcher is appropriate.

Read the [complete decision-engine example](../../docs/decision-engine.md).
