import type { CandidateRejectedEvent } from '../domain/event/candidate-rejected-event.js';
import type { CandidateEvaluation } from '../domain/model/candidate-evaluation.js';
import type { DecisionDefinition } from '../domain/model/decision-definition.js';
import type { DecisionEvent } from '../domain/model/decision-event.js';
import type { DecisionExecution } from '../domain/model/decision-execution.js';
import type { DecisionPolicy } from '../domain/model/decision-policy.js';
import type { DecisionRequest } from '../domain/model/decision-request.js';
import type { DecisionResult } from '../domain/model/decision-result.js';
import type { DecisionValidator } from './decision-validator.js';

import { DecisionError } from '../domain/error/decision-error.js';
import { DecisionExecutionError } from '../domain/error/decision-execution-error.js';

/**
 * Executes reusable decision definitions against runtime decision inputs.
 *
 * The engine is intentionally:
 *
 * - framework-agnostic;
 * - deterministic;
 * - synchronous;
 * - side-effect free;
 * - infrastructure independent;
 * - immutable from the caller's perspective.
 *
 * External I/O, persistence, event publication, logging, and telemetry must
 * happen outside this class.
 */
export class DecisionEngine {
  /**
   * Performs framework-level validation before execution begins.
   */
  private readonly validator: DecisionValidator;

  /**
   * Creates a decision engine.
   *
   * @param validator - Validator responsible for validating decision
   * definitions and runtime requests.
   *
   * @throws TypeError when no validator is supplied.
   */
  public constructor(validator: DecisionValidator) {
    if (!validator) {
      throw new TypeError('Decision validator is required.');
    }

    this.validator = validator;
  }

  /**
   * Executes the complete decision pipeline.
   *
   * Pipeline:
   *
   * 1. Validate definition and request.
   * 2. Validate candidate references.
   * 3. Evaluate hard constraints.
   * 4. Extract features for eligible candidates.
   * 5. Normalize feature values.
   * 6. Score eligible candidates.
   * 7. Rank scored candidates.
   * 8. Select final candidates.
   * 9. Mark selected evaluations.
   * 10. Build immutable result.
   * 11. Produce immutable domain events.
   *
   * @typeParam Candidate - Domain-specific candidate type.
   * @typeParam Context - Runtime decision context type.
   * @typeParam Policy - Identifiable and versioned policy type.
   *
   * @param definition - Reusable decision algorithm definition.
   * @param request - Runtime decision input.
   *
   * @returns Final decision result together with generated domain events.
   *
   * @throws InvalidDecisionDefinitionError when the definition is invalid.
   * @throws DecisionExecutionError when the execution cannot complete safely.
   */
  public execute<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
  ): DecisionExecution<Candidate> {
    this.validator.validateDefinition(definition);

    this.validator.validateRequest(request);

    this.validateCandidateReferences(definition, request);

    const constrained = this.evaluateConstraints(definition, request);
    const featured = this.evaluateFeatures(definition, request, constrained);
    const normalized = this.normalizeFeatures(definition, featured);
    const scored = this.scoreCandidates(definition, request, normalized);
    const ranked = this.rankCandidates(definition, request, scored);

    const selected = this.selectCandidates(definition, request, ranked);

    const evaluations = this.markSelectedCandidates(
      definition,
      ranked,
      selected,
    );

    const result = this.createDecisionResult(definition, request, evaluations);

    const events = this.createDecisionEvents(
      definition,
      request,
      evaluations,
      result,
    );

    return {
      result,
      events,
    };
  }

  private candidateRefs<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): Set<string> {
    return new Set(
      evaluations.map(evaluation =>
        this.resolveCandidateRef(definition, evaluation.candidate),
      ),
    );
  }

  private correlation<Candidate, Context, Policy extends DecisionPolicy>(
    request: DecisionRequest<Candidate, Context, Policy>,
  ): Pick<DecisionEvent, 'correlationId'> {
    return request.correlationId === undefined
      ? {}
      : { correlationId: request.correlationId };
  }

  /**
   * Creates domain events describing externally relevant facts produced
   * during the decision execution.
   *
   * Event publication is intentionally not performed here.
   */
  private createDecisionEvents<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
    result: DecisionResult<Candidate>,
  ): readonly DecisionEvent[] {
    const rejectedEvents: CandidateRejectedEvent[] = evaluations
      .filter(evaluation => !evaluation.eligible)
      .map(evaluation => ({
        type: 'candidate.rejected',
        definitionId: definition.id,
        definitionVersion: definition.version,
        ...this.correlation(request),
        payload: {
          candidateRef: this.resolveCandidateRef(
            definition,
            evaluation.candidate,
          ),
          failedConstraints: evaluation.constraints.filter(
            constraint => !constraint.satisfied,
          ),
        },
      }));
    const eligibleCount = evaluations.length - rejectedEvents.length;

    const completedEvent: DecisionEvent = {
      type: 'decision.completed',
      definitionId: definition.id,
      definitionVersion: definition.version,
      ...this.correlation(request),
      payload: {
        candidateCount: evaluations.length,
        eligibleCount,
        rejectedCount: evaluations.length - eligibleCount,
        selectedCandidateRefs: result.selected.map(evaluation =>
          this.resolveCandidateRef(definition, evaluation.candidate),
        ),
      },
    };

    return [...rejectedEvents, completedEvent];
  }

  /**
   * Creates the canonical immutable decision result.
   */
  private createDecisionResult<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): DecisionResult<Candidate> {
    const selected = this.sortByRank(
      evaluations.filter(evaluation => evaluation.selected),
    );

    return {
      definitionId: definition.id,
      definitionVersion: definition.version,
      policyId: request.policy.id,
      policyVersion: request.policy.version,
      ...this.correlation(request),
      selected,
      evaluations,
    };
  }

  /**
   * Evaluates every configured hard constraint against every candidate.
   *
   * All constraints are evaluated even after one fails so the final
   * evaluation contains the complete rejection explanation.
   *
   * @returns One initial evaluation per candidate.
   */
  private evaluateConstraints<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
  ): readonly CandidateEvaluation<Candidate>[] {
    return request.candidates.map(candidate => {
      const candidateRef = this.resolveCandidateRef(definition, candidate);

      const constraints = definition.constraints.map(constraint => {
        try {
          const result = constraint.evaluate(
            candidate,
            request.context,
            request.policy,
          );

          if (result.constraintId !== constraint.id) {
            throw new DecisionExecutionError(
              'Constraint returned an unexpected constraint identifier.',
              {
                definitionId: definition.id,
                definitionVersion: definition.version,
                stage: 'constraint',
                componentId: constraint.id,
                candidateRef,
                returnedConstraintId: result.constraintId,
              },
            );
          }

          return result;
        } catch (error) {
          return this.rethrowOrWrap(error, 'Constraint evaluation failed.', {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'constraint',
            componentId: constraint.id,
            candidateRef,
          });
        }
      });

      const eligible = constraints.every(constraint => constraint.satisfied);

      return {
        candidate,
        constraints,
        eligible,
        features: [],
        selected: false,
      };
    });
  }

  /**
   * Extracts raw feature values for eligible candidates.
   *
   * Rejected candidates are preserved unchanged and do not incur feature
   * evaluation cost.
   */
  private evaluateFeatures<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    return evaluations.map(evaluation => {
      if (!evaluation.eligible) {
        return evaluation;
      }

      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      const features = definition.features.map(feature => {
        try {
          const value = feature.evaluate(
            evaluation.candidate,
            request.context,
            request.policy,
          );

          if (value.key !== feature.key) {
            throw new DecisionExecutionError(
              'Feature returned an unexpected feature key.',
              {
                definitionId: definition.id,
                definitionVersion: definition.version,
                stage: 'feature',
                componentId: feature.key,
                candidateRef,
                returnedFeatureKey: value.key,
              },
            );
          }

          if (value.objective !== feature.objective) {
            throw new DecisionExecutionError(
              'Feature returned an unexpected optimization objective.',
              {
                definitionId: definition.id,
                definitionVersion: definition.version,
                stage: 'feature',
                componentId: feature.key,
                candidateRef,
              },
            );
          }

          if (!Number.isFinite(value.rawValue)) {
            throw new DecisionExecutionError(
              'Feature returned a non-finite raw value.',
              {
                definitionId: definition.id,
                definitionVersion: definition.version,
                stage: 'feature',
                componentId: feature.key,
                candidateRef,
                rawValue: value.rawValue,
              },
            );
          }

          return value;
        } catch (error) {
          return this.rethrowOrWrap(error, 'Feature evaluation failed.', {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'feature',
            componentId: feature.key,
            candidateRef,
          });
        }
      });

      return {
        ...evaluation,
        features,
      };
    });
  }

  /**
   * Produces the final immutable candidate evaluations by marking only
   * candidates returned by the selection strategy as selected.
   */
  private markSelectedCandidates<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
    selected: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    const selectedRefs = this.candidateRefs(definition, selected);

    return evaluations.map(evaluation => {
      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      return {
        ...evaluation,
        selected: evaluation.eligible && selectedRefs.has(candidateRef),
      };
    });
  }

  /**
   * Normalizes features across all eligible candidates.
   *
   * Rejected evaluations bypass normalization completely.
   */
  private normalizeFeatures<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    const eligible = evaluations.filter(evaluation => evaluation.eligible);

    if (eligible.length === 0) {
      return evaluations;
    }

    let normalized: readonly CandidateEvaluation<Candidate>[];

    try {
      normalized = definition.normalizer.normalize(eligible);
    } catch (error) {
      this.rethrowOrWrap(error, 'Feature normalization failed.', {
        definitionId: definition.id,
        definitionVersion: definition.version,
        stage: 'normalization',
        componentId: definition.normalizer.id,
      });
    }

    if (normalized.length !== eligible.length) {
      throw new DecisionExecutionError(
        'Normalizer changed the number of eligible candidate evaluations.',
        {
          definitionId: definition.id,
          definitionVersion: definition.version,
          stage: 'normalization',
          componentId: definition.normalizer.id,
          expectedCount: eligible.length,
          actualCount: normalized.length,
        },
      );
    }

    for (let index = 0; index < normalized.length; index += 1) {
      const before = eligible[index];
      const after = normalized[index];

      const beforeRef = this.resolveCandidateRef(definition, before.candidate);

      const afterRef = this.resolveCandidateRef(definition, after.candidate);

      if (beforeRef !== afterRef) {
        throw new DecisionExecutionError(
          'Normalizer changed candidate ordering or candidate identity.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'normalization',
            componentId: definition.normalizer.id,
            expectedCandidateRef: beforeRef,
            actualCandidateRef: afterRef,
          },
        );
      }

      if (!after.eligible) {
        throw new DecisionExecutionError(
          'Normalizer changed candidate eligibility.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'normalization',
            componentId: definition.normalizer.id,
            candidateRef: afterRef,
          },
        );
      }

      for (const feature of after.features) {
        if (feature.normalizedValue === undefined) {
          throw new DecisionExecutionError(
            'Normalizer did not produce a normalized feature value.',
            {
              definitionId: definition.id,
              definitionVersion: definition.version,
              stage: 'normalization',
              componentId: definition.normalizer.id,
              candidateRef: afterRef,
              featureKey: feature.key,
            },
          );
        }

        if (!Number.isFinite(feature.normalizedValue)) {
          throw new DecisionExecutionError(
            'Normalizer produced a non-finite feature value.',
            {
              definitionId: definition.id,
              definitionVersion: definition.version,
              stage: 'normalization',
              componentId: definition.normalizer.id,
              candidateRef: afterRef,
              featureKey: feature.key,
              normalizedValue: feature.normalizedValue,
            },
          );
        }
      }
    }

    let eligibleIndex = 0;

    return evaluations.map(evaluation => {
      if (!evaluation.eligible) {
        return evaluation;
      }

      const result = normalized[eligibleIndex];

      eligibleIndex += 1;

      return result;
    });
  }

  /**
   * Orders eligible candidates and assigns one-based ranks.
   *
   * The ranking strategy controls ordering only. The engine deliberately
   * ignores any other mutations potentially returned by the strategy.
   */
  private rankCandidates<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    const eligible = evaluations.filter(evaluation => evaluation.eligible);

    if (eligible.length === 0) {
      return evaluations;
    }

    let ranked: readonly CandidateEvaluation<Candidate>[];

    try {
      ranked = definition.rankingStrategy.rank(
        eligible,
        request.context,
        request.policy,
      );
    } catch (error) {
      this.rethrowOrWrap(error, 'Candidate ranking failed.', {
        definitionId: definition.id,
        definitionVersion: definition.version,
        stage: 'ranking',
        componentId: definition.rankingStrategy.id,
      });
    }

    if (ranked.length !== eligible.length) {
      throw new DecisionExecutionError(
        'Ranking strategy changed the number of eligible candidates.',
        {
          definitionId: definition.id,
          definitionVersion: definition.version,
          stage: 'ranking',
          componentId: definition.rankingStrategy.id,
          expectedCount: eligible.length,
          actualCount: ranked.length,
        },
      );
    }

    const originalByRef = new Map<string, CandidateEvaluation<Candidate>>();

    for (const evaluation of eligible) {
      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      originalByRef.set(candidateRef, evaluation);
    }

    const rankedByRef = new Map<string, CandidateEvaluation<Candidate>>();

    ranked.forEach((evaluation, index) => {
      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      const original = originalByRef.get(candidateRef);

      if (!original) {
        throw new DecisionExecutionError(
          'Ranking strategy returned an unknown candidate.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'ranking',
            componentId: definition.rankingStrategy.id,
            candidateRef,
          },
        );
      }

      if (rankedByRef.has(candidateRef)) {
        throw new DecisionExecutionError(
          'Ranking strategy returned the same candidate more than once.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'ranking',
            componentId: definition.rankingStrategy.id,
            candidateRef,
          },
        );
      }

      rankedByRef.set(candidateRef, {
        ...original,
        rank: index + 1,
      });
    });

    return evaluations.map(evaluation => {
      if (!evaluation.eligible) {
        return evaluation;
      }

      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      const rankedEvaluation = rankedByRef.get(candidateRef);

      if (!rankedEvaluation) {
        throw new DecisionExecutionError(
          'Ranking strategy omitted an eligible candidate.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'ranking',
            componentId: definition.rankingStrategy.id,
            candidateRef,
          },
        );
      }

      return rankedEvaluation;
    });
  }

  /**
   * Resolves a stable reference for one candidate and converts unexpected
   * resolver failures into a decision execution failure.
   */
  private resolveCandidateRef<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    candidate: Candidate,
  ): string {
    try {
      const candidateRef = definition.candidateRefResolver.resolve(candidate);

      if (typeof candidateRef !== 'string') {
        throw new DecisionExecutionError(
          'Candidate reference resolver returned a non-string value.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'candidate-reference',
          },
        );
      }

      return candidateRef;
    } catch (error) {
      this.rethrowOrWrap(error, 'Candidate reference resolution failed.', {
        definitionId: definition.id,
        definitionVersion: definition.version,
        stage: 'candidate-reference',
      });
    }
  }

  /**
   * Preserves known decision errors while wrapping unexpected implementation
   * failures with structured execution metadata.
   *
   * This prevents repeated wrapping of errors already expressed using the
   * decision error model.
   */
  private rethrowOrWrap(
    error: unknown,
    message: string,
    details: Readonly<Record<string, unknown>>,
  ): never {
    if (error instanceof DecisionError) {
      throw error;
    }

    throw new DecisionExecutionError(message, details, error);
  }

  /**
   * Calculates a final numeric score for each eligible candidate.
   */
  private scoreCandidates<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    return evaluations.map(evaluation => {
      if (!evaluation.eligible) {
        return evaluation;
      }

      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      let score: number;

      try {
        score = definition.scoringStrategy.score(
          evaluation.features,
          request.policy,
        );
      } catch (error) {
        this.rethrowOrWrap(error, 'Candidate scoring failed.', {
          definitionId: definition.id,
          definitionVersion: definition.version,
          stage: 'scoring',
          componentId: definition.scoringStrategy.id,
          candidateRef,
        });
      }

      if (!Number.isFinite(score)) {
        throw new DecisionExecutionError(
          'Scoring strategy produced a non-finite score.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'scoring',
            componentId: definition.scoringStrategy.id,
            candidateRef,
            score,
          },
        );
      }

      return {
        ...evaluation,
        score,
      };
    });
  }

  /**
   * Invokes the configured selection strategy against candidates ordered
   * by their assigned rank.
   *
   * @returns Validated selected candidate evaluations.
   */
  private selectCandidates<Candidate, Context, Policy extends DecisionPolicy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): readonly CandidateEvaluation<Candidate>[] {
    const ranked = this.sortByRank(
      evaluations.filter(
        (evaluation): evaluation is CandidateEvaluation<Candidate> =>
          evaluation.eligible && evaluation.rank !== undefined,
      ),
    );

    let selected: readonly CandidateEvaluation<Candidate>[];

    try {
      selected = definition.selectionStrategy.select(
        ranked,
        request.context,
        request.policy,
      );
    } catch (error) {
      this.rethrowOrWrap(error, 'Candidate selection failed.', {
        definitionId: definition.id,
        definitionVersion: definition.version,
        stage: 'selection',
        componentId: definition.selectionStrategy.id,
      });
    }

    const rankedRefs = this.candidateRefs(definition, ranked);

    const selectedRefs = new Set<string>();

    for (const evaluation of selected) {
      const candidateRef = this.resolveCandidateRef(
        definition,
        evaluation.candidate,
      );

      if (!rankedRefs.has(candidateRef)) {
        throw new DecisionExecutionError(
          'Selection strategy returned a candidate outside the ranked set.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'selection',
            componentId: definition.selectionStrategy.id,
            candidateRef,
          },
        );
      }

      if (selectedRefs.has(candidateRef)) {
        throw new DecisionExecutionError(
          'Selection strategy returned the same candidate more than once.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'selection',
            componentId: definition.selectionStrategy.id,
            candidateRef,
          },
        );
      }

      selectedRefs.add(candidateRef);
    }

    /*
     * Return the engine-owned ranked evaluations rather than trusting
     * potentially modified evaluation objects returned by the strategy.
     */
    return ranked.filter(evaluation =>
      selectedRefs.has(
        this.resolveCandidateRef(definition, evaluation.candidate),
      ),
    );
  }

  private sortByRank<Candidate>(
    evaluations: readonly CandidateEvaluation<Candidate>[],
  ): CandidateEvaluation<Candidate>[] {
    return [...evaluations].sort(
      (left, right) =>
        (left.rank ?? Number.MAX_SAFE_INTEGER) -
        (right.rank ?? Number.MAX_SAFE_INTEGER),
    );
  }

  /**
   * Ensures every candidate resolves to a valid and unique stable reference.
   *
   * Candidate references are required for event generation, diagnostics,
   * selection validation, and deterministic association between pipeline stages.
   *
   * @param definition - Active decision definition.
   * @param request - Runtime decision request.
   *
   * @throws DecisionExecutionError when a candidate reference is empty,
   * duplicated, or cannot be resolved.
   */
  private validateCandidateReferences<
    Candidate,
    Context,
    Policy extends DecisionPolicy,
  >(
    definition: DecisionDefinition<Candidate, Context, Policy>,
    request: DecisionRequest<Candidate, Context, Policy>,
  ): void {
    const references = new Set<string>();

    for (const candidate of request.candidates) {
      const candidateRef = this.resolveCandidateRef(definition, candidate);

      if (candidateRef.trim().length === 0) {
        throw new DecisionExecutionError(
          'Candidate reference must not be empty.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'candidate-reference',
          },
        );
      }

      if (references.has(candidateRef)) {
        throw new DecisionExecutionError(
          'Candidate references must be unique within one decision execution.',
          {
            definitionId: definition.id,
            definitionVersion: definition.version,
            stage: 'candidate-reference',
            candidateRef,
          },
        );
      }

      references.add(candidateRef);
    }
  }
}
