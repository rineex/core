/**
 * Resolves a stable reference for a decision candidate.
 *
 * The resolver must be deterministic and side-effect free.
 *
 * @typeParam Candidate - Domain-specific candidate type.
 */
export interface CandidateRefResolver<Candidate> {
  /**
   * Resolves a stable reference for the supplied candidate.
   *
   * The returned value should uniquely identify the candidate
   * within the scope of the decision domain.
   *
   * Examples:
   * supplier.id
   * machine.code
   * route.key
   * composite business identifier
   *
   * @param candidate - Candidate whose reference should be resolved.
   * @returns Stable candidate reference.
   */
  resolve: (candidate: Candidate) => string;
}
