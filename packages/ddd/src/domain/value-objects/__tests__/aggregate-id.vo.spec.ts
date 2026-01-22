import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '../../errors/invalid-vo.error';
import { AggregateId } from '../aggregate-id.vo';

describe('aggregateId', () => {
  it('should generate a valid AggregateId', () => {
    const id = AggregateId.generate();

    expect(id).toBeInstanceOf(AggregateId);
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should create AggregateId from valid UUID string', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = AggregateId.fromString(validUuid);

    expect(id).toBeInstanceOf(AggregateId);
    expect(id.value).toBe(validUuid);
  });

  it('should throw InvalidValueObjectError for invalid UUID string', () => {
    const invalidUuid = 'not-a-uuid';

    expect(() => AggregateId.fromString(invalidUuid)).toThrow(
      // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      InvalidValueObjectError,
    );
  });

  it('should throw InvalidValueObjectError for empty string', () => {
    // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
    expect(() => AggregateId.fromString('')).toThrow(InvalidValueObjectError);
  });

  it('should throw InvalidValueObjectError for malformed UUID', () => {
    expect(() => AggregateId.fromString('550e8400-e29b-41d4-a716')).toThrow(
      // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      InvalidValueObjectError,
    );
  });

  it('should generate unique AggregateIds', () => {
    const id1 = AggregateId.generate();
    const id2 = AggregateId.generate();

    expect(id1.value).not.toBe(id2.value);
  });
});
