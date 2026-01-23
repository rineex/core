import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '../../errors/invalid-vo.error';
import { ValueObject } from '../vo';

// Test implementation of ValueObject

class TestValueObject extends ValueObject<{ name: string; age: number }> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: { name: string; age: number }) {
    super(props);
  }

  protected validate(props: { name: string; age: number }): void {
    if (!props.name || props.name.trim().length === 0) {
      throw InvalidValueObjectError.create('Name is required');
    }
    if (props.age < 0 || props.age > 150) {
      throw InvalidValueObjectError.create('Age must be between 0 and 150');
    }
  }
}

class SimpleValueObject extends ValueObject<string> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || value.length === 0) {
      throw InvalidValueObjectError.create('Value cannot be empty');
    }
  }
}

describe('valueObject', () => {
  describe('constructor', () => {
    it('should create a valid value object', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });

      expect(vo.value).toEqual({ name: 'John', age: 30 });
    });

    it('should freeze the props', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });

      expect(() => {
        (vo.value as any).name = 'Jane';
      }).toThrow('Cannot assign to read only property');
    });

    it('should throw error if validation fails', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new TestValueObject({ name: '', age: 30 });
      }).toThrow('Name is required');
    });

    it('should throw error for invalid age', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new TestValueObject({ name: 'John', age: -1 });
      }).toThrow('Age must be between 0 and 150');

      expect(() => {
        // eslint-disable-next-line no-new
        new TestValueObject({ name: 'John', age: 200 });
      }).toThrow('Age must be between 0 and 150');
    });
  });

  describe('equals', () => {
    it('should return true for equal value objects', () => {
      const vo1 = new TestValueObject({ name: 'John', age: 30 });
      const vo2 = new TestValueObject({ name: 'John', age: 30 });

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different value objects', () => {
      const vo1 = new TestValueObject({ name: 'John', age: 30 });
      const vo2 = new TestValueObject({ name: 'Jane', age: 30 });

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for different types', () => {
      const vo1 = new TestValueObject({ name: 'John', age: 30 });
      const vo2 = new SimpleValueObject('test');

      expect(vo1.equals(vo2 as any)).toBe(false);
    });

    it('should return false for null', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });

      expect(vo.equals(null)).toBe(false);
      expect(vo.equals(undefined)).toBe(false);
    });

    it('should return false for different ages', () => {
      const vo1 = new TestValueObject({ name: 'John', age: 30 });
      const vo2 = new TestValueObject({ name: 'John', age: 31 });

      expect(vo1.equals(vo2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return the props as JSON', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });
      const json = vo.toJSON();

      expect(json).toEqual({ name: 'John', age: 30 });
    });

    it('should return primitive value for simple value object', () => {
      const vo = new SimpleValueObject('test');
      const json = vo.toJSON();

      expect(json).toBe('test');
    });
  });

  describe('toString', () => {
    it('should return JSON string representation', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });
      const str = vo.toString();

      expect(str).toBe('{"name":"John","age":30}');
    });

    it('should return string representation for simple value object', () => {
      const vo = new SimpleValueObject('test');
      const str = vo.toString();

      expect(str).toBe('"test"');
    });
  });

  describe('is', () => {
    it('should return true for ValueObject instance', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });

      expect(ValueObject.is(vo)).toBe(true);
    });

    it('should return false for non-ValueObject', () => {
      expect(ValueObject.is({ name: 'John' })).toBe(false);
      expect(ValueObject.is(null)).toBe(false);
      expect(ValueObject.is(undefined)).toBe(false);
      expect(ValueObject.is('string')).toBe(false);
      expect(ValueObject.is(123)).toBe(false);
    });
  });

  describe('value getter', () => {
    it('should return frozen props', () => {
      const vo = new TestValueObject({ name: 'John', age: 30 });
      const value = vo.value;

      expect(() => {
        (value as any).name = 'Jane';
      }).toThrow('Cannot assign to read only property');
    });
  });
});
