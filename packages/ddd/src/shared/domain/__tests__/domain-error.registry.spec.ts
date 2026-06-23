import { describe, expect, it } from 'vitest';

import {
  CoreDomainErrorRegistry,
  registryErrorCodes,
} from '../domain-error.registry';

describe('coreDomainErrorRegistry', () => {
  it('should expose all core namespaces', () => {
    expect(Object.keys(CoreDomainErrorRegistry).sort()).toEqual([
      'CORE',
      'DOMAIN',
      'SYSTEM',
    ]);
  });

  it('should derive runtime codes from registry', () => {
    const codes = registryErrorCodes(CoreDomainErrorRegistry);

    expect(codes.has('DOMAIN.INVALID_VALUE')).toBe(true);
    expect(codes.has('DOMAIN.INVALID_STATE')).toBe(true);
    expect(codes.has('CORE.VALIDATION_FAILED')).toBe(true);
    expect(codes.has('SYSTEM.TIMEOUT')).toBe(true);
    expect(codes.size).toBe(10);
  });
});
