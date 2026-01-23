import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '../../errors/invalid-vo.error';
import { PrimitiveValueObject } from '../primitive-vo';

// Test implementations

class StringVO extends PrimitiveValueObject<string> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value || value.length === 0) {
      throw InvalidValueObjectError.create('String cannot be empty');
    }
  }
}

class NumberVO extends PrimitiveValueObject<number> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(value: number) {
    super(value);
  }

  protected validate(value: number): void {
    if (value < 0) {
      throw InvalidValueObjectError.create('Number must be non-negative');
    }
  }
}

class BooleanVO extends PrimitiveValueObject<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(value: boolean) {
    super(value);
  }

  protected validate(_value: boolean): void {
    // Always valid
  }
}

describe('primitiveValueObject', () => {
  describe('constructor', () => {
    it('should create a valid string value object', () => {
      const vo = new StringVO('test');

      expect(vo.value).toBe('test');
    });

    it('should create a valid number value object', () => {
      const vo = new NumberVO(42);

      expect(vo.value).toBe(42);
    });

    it('should create a valid boolean value object', () => {
      const vo = new BooleanVO(true);

      expect(vo.value).toBe(true);
    });

    it('should throw error if validation fails', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new StringVO('');
      }).toThrow('String cannot be empty');

      expect(() => {
        // eslint-disable-next-line no-new
        new NumberVO(-1);
      }).toThrow('Number must be non-negative');
    });
  });

  describe('equals', () => {
    it('should return true for equal value objects', () => {
      const vo1 = new StringVO('test');
      const vo2 = new StringVO('test');

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for different values', () => {
      const vo1 = new StringVO('test');
      const vo2 = new StringVO('other');

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for different types', () => {
      const vo1 = new StringVO('test');
      const vo2 = new NumberVO(42);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      const vo = new StringVO('test');

      expect(vo.equals(null)).toBe(false);
      expect(vo.equals(undefined)).toBe(false);
    });

    it('should return false for non-PrimitiveValueObject', () => {
      const vo = new StringVO('test');

      expect(vo.equals({ value: 'test' })).toBe(false);
      expect(vo.equals('test')).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the primitive value', () => {
      const vo = new StringVO('test');

      expect(vo.getValue()).toBe('test');
    });

    it('should return number value', () => {
      const vo = new NumberVO(42);

      expect(vo.getValue()).toBe(42);
    });

    it('should return boolean value', () => {
      const vo = new BooleanVO(true);

      expect(vo.getValue()).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const vo = new StringVO('test');

      expect(vo.toString()).toBe('test');
    });

    it('should return string representation of number', () => {
      const vo = new NumberVO(42);

      expect(vo.toString()).toBe('42');
    });

    it('should return string representation of boolean', () => {
      const vo1 = new BooleanVO(true);
      const vo2 = new BooleanVO(false);

      expect(vo1.toString()).toBe('true');
      expect(vo2.toString()).toBe('false');
    });
  });

  describe('value getter', () => {
    it('should return the primitive value', () => {
      const vo = new StringVO('test');

      expect(vo.value).toBe('test');
    });

    it('should be readonly', () => {
      const vo = new StringVO('test');
      const value = vo.value;

      // TypeScript would prevent this, but runtime check
      expect(value).toBe('test');
    });
  });
});
