import type { DecisionDefinition } from '../domain/model/decision-definition.js';
import type { DecisionRequest } from '../domain/model/decision-request.js';
import type { DecisionValidator } from './decision-validator.js';

import { DecisionExecutionError } from '../domain/error/decision-execution-error.js';
import { InvalidDecisionDefinitionError } from '../domain/error/invalid-decision-definition-error.js';
import { FeatureObjective } from '../domain/feature/feature-objective.js';

/**
 * Default validator for decision definitions and execution requests.
 *
 * Performs framework-level validation only.
 * Domain-specific validation remains the responsibility of policies,
 * constraints, features, and strategies.
 */
export class DefaultDecisionValidator implements DecisionValidator {
  /**
   * Validates the reusable decision definition.
   */
  public validateDefinition<Candidate, Context, Policy>(
    definition: DecisionDefinition<Candidate, Context, Policy>,
  ): void {
    if (!definition || typeof definition !== 'object') {
      throw new InvalidDecisionDefinitionError(
        'Decision definition is required.',
      );
    }

    this.requireText(definition.id, 'definition id');
    this.requireText(definition.version, 'definition version');

    if (
      !definition.candidateRefResolver ||
      typeof definition.candidateRefResolver.resolve !== 'function'
    ) {
      throw new InvalidDecisionDefinitionError(
        'A candidate reference resolver is required.',
      );
    }

    this.validateComponents(definition.constraints, 'constraint', 'id');
    this.validateComponents(definition.features, 'feature', 'key');
    for (const feature of definition.features) {
      if (
        feature.objective !== FeatureObjective.MAXIMIZE &&
        feature.objective !== FeatureObjective.MINIMIZE
      ) {
        throw new InvalidDecisionDefinitionError(
          'Feature objective must be maximize or minimize.',
          { featureKey: feature.key, objective: feature.objective },
        );
      }
    }
    this.validateStrategy(definition.normalizer, 'normalizer', 'normalize');
    this.validateStrategy(
      definition.scoringStrategy,
      'scoring strategy',
      'score',
    );
    this.validateStrategy(
      definition.rankingStrategy,
      'ranking strategy',
      'rank',
    );
    this.validateStrategy(
      definition.selectionStrategy,
      'selection strategy',
      'select',
    );
  }

  /**
   * Validates runtime decision input.
   */
  public validateRequest<Candidate, Context, Policy>(
    request: DecisionRequest<Candidate, Context, Policy>,
  ): void {
    if (!request || typeof request !== 'object') {
      throw new DecisionExecutionError('Decision request is required.');
    }

    if (!Array.isArray(request.candidates)) {
      throw new DecisionExecutionError(
        'Decision request candidates must be an array.',
      );
    }

    if (!request.policy || typeof request.policy !== 'object') {
      throw new DecisionExecutionError('Decision request policy is required.');
    }

    const policy = request.policy as Record<string, unknown>;
    this.requireRequestText(policy.id, 'policy id');
    this.requireRequestText(policy.version, 'policy version');

    if (request.correlationId !== undefined) {
      this.requireRequestText(request.correlationId, 'correlation id');
    }
  }

  private requireRequestText(
    value: unknown,
    label: string,
  ): asserts value is string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new DecisionExecutionError(
        `Decision ${label} must be a non-empty string.`,
      );
    }
  }

  private requireText(value: unknown, label: string): asserts value is string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new InvalidDecisionDefinitionError(
        `Decision ${label} must be a non-empty string.`,
      );
    }
  }

  private validateComponents(
    components: unknown,
    componentName: string,
    identifier: 'id' | 'key',
  ): void {
    if (!Array.isArray(components)) {
      throw new InvalidDecisionDefinitionError(
        `Decision ${componentName}s must be an array.`,
      );
    }

    const identifiers = new Set<string>();
    for (const component of components) {
      if (!component || typeof component !== 'object') {
        throw new InvalidDecisionDefinitionError(
          `Each ${componentName} must be an object.`,
        );
      }
      const record = component as Record<string, unknown>;
      const value = record[identifier];
      this.requireText(value, `${componentName} ${identifier}`);
      if (identifiers.has(value)) {
        throw new InvalidDecisionDefinitionError(
          `Decision ${componentName} ${identifier}s must be unique.`,
          { value },
        );
      }
      if (typeof record.evaluate !== 'function') {
        throw new InvalidDecisionDefinitionError(
          `Decision ${componentName} ${value} must implement evaluate.`,
        );
      }
      identifiers.add(value);
    }
  }

  private validateStrategy(
    strategy: unknown,
    label: string,
    method: string,
  ): void {
    if (!strategy || typeof strategy !== 'object') {
      throw new InvalidDecisionDefinitionError(
        `Decision ${label} is required.`,
      );
    }
    const record = strategy as Record<string, unknown>;
    this.requireText(record.id, `${label} id`);
    if (typeof record[method] !== 'function') {
      throw new InvalidDecisionDefinitionError(
        `Decision ${label} must implement ${method}.`,
      );
    }
  }
}
