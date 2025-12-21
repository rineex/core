import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '../../errors/invalid-vo.error';
import { UUID } from '../id.vo';

describe('uUID.validate', () => {
  it('should not throw when given a valid UUID string', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';

    expect(() => UUID.fromString(validUUID)).not.toThrow();
  });

  it('should throw InvalidValueObjectError when given an invalid UUID string', () => {
    const invalidUUID = 'not-a-uuid';

    expect(() => UUID.fromString(invalidUUID)).toThrow(InvalidValueObjectError);
  });

  it('should throw InvalidValueObjectError with descriptive message for invalid UUID', () => {
    const invalidUUID = 'invalid-uuid-format';

    expect(() => UUID.fromString(invalidUUID)).toThrow(/Invalid UUID:/);
  });

  it('should accept a newly generated UUID', () => {
    const uuid = UUID.generate();

    expect(uuid).toBeDefined();
  });

  it('should throw InvalidValueObjectError for empty string', () => {
    expect(() => UUID.fromString('')).toThrow(InvalidValueObjectError);
  });

  it('should throw InvalidValueObjectError for malformed UUID (wrong format)', () => {
    expect(() => UUID.fromString('550e8400-e29b-41d4-a716')).toThrow(
      InvalidValueObjectError,
    );
  });
});
