import { describe, expect, it } from 'vitest';

import { resolveExecuteResult } from '../resolve-execute-result';

describe('resolveExecuteResult', () => {
  it('resolves a synchronous value', async () => {
    await expect(resolveExecuteResult(42)).resolves.toBe(42);
  });

  it('resolves a fulfilled promise', async () => {
    await expect(resolveExecuteResult(Promise.resolve('ok'))).resolves.toBe(
      'ok',
    );
  });

  it('rejects when the input promise rejects', async () => {
    const error = new Error('boom');

    await expect(resolveExecuteResult(Promise.reject(error))).rejects.toThrow(
      error,
    );
  });
});
