import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';

import { Url } from '../url.vo';

describe('url ValueObject', () => {
  const validUrl = 'https://example.com';
  const anotherValidUrl = 'https://openai.com';
  const invalidUrl = 'not-a-url';

  it('should create a Url instance with a valid URL', () => {
    const url = Url.create(validUrl);

    expect(url.value).toBe(validUrl);
  });

  it('should throw an error for an invalid URL', () => {
    expect(() => Url.create(invalidUrl)).toThrow(InvalidValueObjectError);
  });

  it('should be equal if URLs are the same', () => {
    const url1 = Url.create(validUrl);
    const url2 = Url.create(validUrl);

    expect(url1.equals(url2)).toBe(true);
  });

  it('should not be equal if URLs are different', () => {
    const url1 = Url.create(validUrl);
    const url2 = Url.create(anotherValidUrl);

    expect(url1.equals(url2)).toBe(false);
  });

  it('should not be equal to null or undefined', () => {
    const url = Url.create(validUrl);

    expect(url.equals(null)).toBe(false);
    expect(url.equals(undefined)).toBe(false);
  });
});
