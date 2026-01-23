import { describe, expect, it } from 'vitest';

import { DomainID } from '../domain-id.vo';

// Test implementation
class TestDomainID extends DomainID {}

describe('domainID', () => {
  describe('constructor', () => {
    it('should create a valid DomainID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = new TestDomainID(validUuid);

      expect(id.value).toBe(validUuid);
    });

    it('should throw InvalidValueObjectError for invalid UUID', () => {
      const invalidUuids = ['not-a-uuid', '', '550e8400-e29b-41d4-a716'];

      invalidUuids.forEach(uuid => {
        expect(() => {
          // eslint-disable-next-line no-new
          new TestDomainID(uuid);
        }).toThrow('Invalid UUID');
      });
    });
  });

  describe('fromString', () => {
    it('should create DomainID from string', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = TestDomainID.fromString(validUuid);

      expect(id).toBeInstanceOf(TestDomainID);
      expect(id.value).toBe(validUuid);
    });

    it('should throw error for invalid UUID', () => {
      expect(() => {
        TestDomainID.fromString('invalid-uuid');
      }).toThrow('Invalid UUID');
    });
  });

  describe('generate', () => {
    it('should generate a valid DomainID', () => {
      const id = TestDomainID.generate();

      expect(id).toBeInstanceOf(TestDomainID);
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique DomainIDs', () => {
      const id1 = TestDomainID.generate();
      const id2 = TestDomainID.generate();

      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('equals', () => {
    it('should return true for equal DomainIDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = new TestDomainID(uuid);
      const id2 = new TestDomainID(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different DomainIDs', () => {
      const id1 = new TestDomainID('550e8400-e29b-41d4-a716-446655440000');
      const id2 = new TestDomainID('650e8400-e29b-41d4-a716-446655440000');

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = new TestDomainID(uuid);

      expect(id.toString()).toBe(uuid);
    });
  });
});
