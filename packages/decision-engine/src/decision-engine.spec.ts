import { describe, expect, it } from 'vitest';

import type {
  CandidateEvaluation,
  DecisionDefinition,
  DecisionPolicy,
  DecisionRequest,
} from './index.js';

import {
  DecisionEngine,
  DefaultDecisionValidator,
  DescendingScoreRankingStrategy,
  FeatureObjective,
  InMemoryDecisionEventPublisher,
  MinMaxNormalizer,
  SelectTopNStrategy,
  WeightedSumScoringStrategy,
} from './index.js';

interface Candidate {
  readonly id: string;
  readonly cost: number;
  readonly quality: number;
  readonly approved: boolean;
}

interface Policy extends DecisionPolicy {
  readonly values: {
    readonly qualityWeight: number;
    readonly costWeight: number;
  };
}

const definition: DecisionDefinition<Candidate, undefined, Policy> = {
  id: 'supplier-selection',
  version: 'v1',
  candidateRefResolver: { resolve: candidate => candidate.id },
  constraints: [
    {
      id: 'approved',
      evaluate: candidate =>
        candidate.approved
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
      evaluate: candidate => ({
        key: 'quality',
        objective: FeatureObjective.MAXIMIZE,
        rawValue: candidate.quality,
      }),
    },
    {
      key: 'cost',
      objective: FeatureObjective.MINIMIZE,
      evaluate: candidate => ({
        key: 'cost',
        objective: FeatureObjective.MINIMIZE,
        rawValue: candidate.cost,
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

const request: DecisionRequest<Candidate, undefined, Policy> = {
  candidates: [
    { id: 'slow-cheap', quality: 50, cost: 10, approved: true },
    { id: 'fast-expensive', quality: 100, cost: 100, approved: true },
    { id: 'blocked', quality: 90, cost: 30, approved: false },
  ],
  context: undefined,
  policy: {
    id: 'default',
    version: 'v1',
    values: { qualityWeight: 0.75, costWeight: 0.25 },
  },
  correlationId: 'decision-42',
};

describe('decisionEngine', () => {
  it('executes constraints, normalization, scoring, ranking, selection, and events', () => {
    const execution = new DecisionEngine(
      new DefaultDecisionValidator(),
    ).execute(definition, request);

    expect(
      execution.result.selected.map(evaluation => evaluation.candidate.id),
    ).toEqual(['fast-expensive']);
    expect(
      execution.result.evaluations.map(evaluation => ({
        id: evaluation.candidate.id,
        score: evaluation.score,
        rank: evaluation.rank,
        selected: evaluation.selected,
      })),
    ).toEqual([
      { id: 'slow-cheap', score: 0.25, rank: 2, selected: false },
      { id: 'fast-expensive', score: 0.75, rank: 1, selected: true },
      { id: 'blocked', score: undefined, rank: undefined, selected: false },
    ]);
    expect(execution.events).toEqual([
      expect.objectContaining({
        type: 'candidate.rejected',
        correlationId: 'decision-42',
      }),
      expect.objectContaining({
        type: 'decision.completed',
        payload: expect.objectContaining({
          candidateCount: 3,
          eligibleCount: 2,
          rejectedCount: 1,
          selectedCandidateRefs: ['fast-expensive'],
        }),
      }),
    ]);
    expect(Object.isFrozen(execution)).toBe(true);
    expect(Object.isFrozen(execution.result.evaluations)).toBe(true);
    expect(Object.isFrozen(execution.result.evaluations[0].features)).toBe(
      true,
    );
    expect(Object.isFrozen(execution.events)).toBe(true);
  });

  it('rejects duplicate candidate references before evaluating a candidate', () => {
    const duplicated = {
      ...request,
      candidates: [request.candidates[0], { ...request.candidates[0] }],
    };

    expect(() =>
      new DecisionEngine(new DefaultDecisionValidator()).execute(
        definition,
        duplicated,
      ),
    ).toThrow('Candidate references must be unique');
  });

  it('normalizes a zero-range feature to one without mutating source evaluations', () => {
    const evaluations: CandidateEvaluation<Candidate>[] = [
      {
        candidate: request.candidates[0],
        constraints: [],
        eligible: true,
        selected: false,
        features: [
          {
            key: 'quality',
            objective: FeatureObjective.MAXIMIZE,
            rawValue: 10,
          },
        ],
      },
      {
        candidate: request.candidates[1],
        constraints: [],
        eligible: true,
        selected: false,
        features: [
          {
            key: 'quality',
            objective: FeatureObjective.MAXIMIZE,
            rawValue: 10,
          },
        ],
      },
    ];
    const normalized = new MinMaxNormalizer<Candidate>().normalize(evaluations);

    expect(
      normalized.map(evaluation => evaluation.features[0].normalizedValue),
    ).toEqual([1, 1]);
    expect(evaluations[0].features[0].normalizedValue).toBeUndefined();
  });
});

describe('inMemoryDecisionEventPublisher', () => {
  it('delivers matching events and handlers in registration order', async () => {
    const publisher = new InMemoryDecisionEventPublisher();
    const calls: string[] = [];
    publisher.subscribe('decision.completed', {
      handle: async () => {
        calls.push('first');
      },
    });
    publisher.subscribe('decision.completed', {
      handle: async () => {
        calls.push('second');
      },
    });

    await publisher.publish([
      {
        type: 'decision.completed',
        definitionId: 'definition',
        definitionVersion: 'v1',
        payload: {},
      },
    ]);

    expect(calls).toEqual(['first', 'second']);
  });
});
