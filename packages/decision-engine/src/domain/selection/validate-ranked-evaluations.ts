import type { CandidateEvaluation } from '../model/candidate-evaluation.js';

import { DecisionExecutionError } from '../error/decision-execution-error.js';

/** Verifies that a selection strategy received engine-ranked evaluations. */
export function validateRankedEvaluations<Candidate>(
  evaluations: readonly CandidateEvaluation<Candidate>[],
): void {
  evaluations.forEach((evaluation, index) => {
    if (
      !evaluation.eligible ||
      typeof evaluation.score !== 'number' ||
      !Number.isFinite(evaluation.score) ||
      evaluation.rank !== index + 1
    ) {
      throw new DecisionExecutionError(
        'Selection requires eligible evaluations with finite scores in rank order.',
      );
    }
  });
}
