import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';

import { IPAddress } from '../ip.vo';

describe('iPAddress Value Object', () => {
  it('should create valid IPv4 addresses', () => {
    const ip = IPAddress.create('192.168.1.1');

    expect(ip.value).toBe('192.168.1.1');
  });

  it('should create valid IPv6 addresses', () => {
    const ip = IPAddress.create('2001:0db8:85a3:0000:0000:8a2e:0370:7334');

    expect(ip.value).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should throw for invalid IP addresses', () => {
    expect(() => IPAddress.create('999.999.999.999')).toThrowError(
      // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      InvalidValueObjectError,
    );
    expect(() => IPAddress.create('not.an.ip.address')).toThrowError(
      // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      InvalidValueObjectError,
    );

    // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
    expect(() => IPAddress.create('')).toThrowError(InvalidValueObjectError);
  });

  it('should be immutable', () => {
    const ip = IPAddress.create('127.0.0.1');

    expect(() => {
      // @ts-expect-error: Direct mutation should not be allowed
      ip.props.value = '8.8.8.8';
    }).toThrowError(TypeError);
  });
});
