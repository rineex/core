import { ValueObject } from '@/domain/base/vo';

export type UnwrapValueObject<T> =
  T extends ValueObject<infer V>
    ? UnwrapValueObject<V>
    : T extends (infer U)[]
      ? UnwrapValueObject<U>[]
      : T extends Map<infer K, infer V>
        ? Map<K, UnwrapValueObject<V>>
        : T extends Set<infer V>
          ? Set<UnwrapValueObject<V>>
          : T extends Date
            ? string
            : T extends object
              ? { [K in keyof T]: UnwrapValueObject<T[K]> }
              : T;

export function unwrapValueObject<T>(
  input: T,
  seen = new WeakSet(),
): UnwrapValueObject<T> {
  if (input === null || input === undefined) {
    return input as UnwrapValueObject<T>;
  }

  if (typeof input !== 'object') {
    return input as UnwrapValueObject<T>;
  }

  if (seen.has(input)) {
    // Prevent circular reference infinite recursion, just return input or throw
    throw new Error('Circular reference detected in ValueObject unwrap');
  }

  seen.add(input);

  if (Array.isArray(input)) {
    const result = input.map(item => unwrapValueObject(item, seen));
    seen.delete(input);
    return result as UnwrapValueObject<T>;
  }

  if (input instanceof ValueObject) {
    const result = unwrapValueObject(input.value, seen);
    seen.delete(input);
    return result as UnwrapValueObject<T>;
  }

  if (input instanceof Date) {
    seen.delete(input);
    return input.toISOString() as UnwrapValueObject<T>;
  }

  if (input instanceof Map) {
    const result = new Map();
    input.forEach((value, key) => {
      result.set(key, unwrapValueObject(value, seen));
    });
    seen.delete(input);
    return result as UnwrapValueObject<T>;
  }

  if (input instanceof Set) {
    const result = new Set(
      Array.from(input.values()).map(v => unwrapValueObject(v, seen)),
    );
    seen.delete(input);
    return result as UnwrapValueObject<T>;
  }

  // generic object
  const result: Record<string, unknown> = {};

  for (const key in input) {
    if (Object.hasOwn(input, key)) {
      result[key] = unwrapValueObject((input as any)[key], seen);
    }
  }

  seen.delete(input);
  return result as UnwrapValueObject<T>;
}

export function ensureObject<T>(input: UnwrapValueObject<T>): object {
  if (input === null || input === undefined) {
    return {};
  }
  if (typeof input === 'object') {
    return input;
  }

  // for primitives, wrap inside object with default key (or throw)
  return { value: input };
}
