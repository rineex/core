import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../../../domain/errors/entity-validation.error';
import { InvalidValueObjectError } from '../../../domain/errors/invalid-vo.error';
import {
  CoreDomainErrorRegistry,
  registryErrorCodes,
} from '../domain-error.registry';
import { InternalError } from '../errors/internal.error';
import { InvalidStateError } from '../errors/invalid-state.error';
import { InvalidValueError } from '../errors/invalid-value.error';
import { TimeoutError } from '../errors/timeout.error';

const coreCodes = registryErrorCodes(CoreDomainErrorRegistry);

describe('domainError architecture', () => {
  it('should register all built-in ddd error codes in CoreDomainErrorRegistry', () => {
    const errors = [
      new InvalidValueError(),
      new InvalidStateError(),
      new InternalError(),
      new TimeoutError('timeout'),
      new EntityValidationError('x', {}),
      InvalidValueObjectError.create(),
    ];

    for (const error of errors) {
      expect(coreCodes.has(error.code)).toBe(true);
    }
  });
});
