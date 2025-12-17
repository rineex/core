import { describe, expect, it } from 'vitest';
import { v4 } from 'uuid';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';

import { AggregateId } from '../aggregate-id.vo';

describe('aggregateId', () => {
  it('should generate a valid AggregateId with UUIDv4', () => {
    const id = AggregateId.generate();

    expect(id.value).toBeTypeOf('string');
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should create AggregateId from valid UUID string', () => {
    const raw = v4();
    const id = AggregateId.create(raw);

    expect(id.value).toBe(raw);
    expect(id.uuid).toBe(raw);
  });

  it('should throw InvalidValueObjectException on invalid UUID string', () => {
    const invalidId = 'not-a-valid-uuid';

    expect(() => AggregateId.create(invalidId)).toThrow(
      InvalidValueObjectError,
    );
  });

  it('should consider two AggregateIds with same value equal', () => {
    const raw = v4();
    const a = AggregateId.create(raw);
    const b = AggregateId.create(raw);

    expect(a.equals(b)).toBe(true);
  });

  it('should not consider two different AggregateIds equal', () => {
    const a = AggregateId.generate();
    const b = AggregateId.generate();

    expect(a.equals(b)).toBe(false);
  });
});
