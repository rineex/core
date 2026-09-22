import { describe, expect, it } from 'vitest';

import { initDecisionEngine } from './decision-engine';

describe('initDecisionEngine', () => {
  it('initializes an immutable module with its default name', () => {
    const module = initDecisionEngine();

    expect(module).toEqual({ name: 'decision-engine', version: undefined });
    expect(Object.isFrozen(module)).toBe(true);
  });

  it('uses normalized options when they are supplied', () => {
    expect(
      initDecisionEngine({ name: '  checkout  ', version: ' 1.0.0 ' }),
    ).toEqual({ name: 'checkout', version: '1.0.0' });
  });
});
