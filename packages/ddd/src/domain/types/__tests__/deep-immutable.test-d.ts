/* eslint-disable vitest/require-hook */
import { expectAssignable, expectType } from 'tsd';

import type { DeepImmutable } from '../deep-immutable.type';

// Helper to get a value of type DeepImmutable<T> without runtime value (for type assertions only)
function imm<T>(): DeepImmutable<T> {
  return undefined as unknown as DeepImmutable<T>;
}

// --- Primitives remain as-is ---
expectType<string>(imm<string>());
expectType<number>(imm<number>());
expectType<boolean>(imm<boolean>());
expectType<null>(imm<null>());
expectType<undefined>(imm<undefined>());
expectType<symbol>(imm<symbol>());

// --- Functions are preserved ---
expectType<(x: number) => string>(imm<(x: number) => string>());
expectType<() => void>(imm<() => void>());

// --- Date is preserved ---
expectType<Date>(imm<Date>());

// --- Promise: deep readonly of resolved type ---
expectAssignable<Promise<{ readonly id: number }>>(
  imm<Promise<{ id: number }>>(),
);
expectAssignable<Promise<readonly number[]>>(imm<Promise<number[]>>());

// --- Map → ReadonlyMap with deep immutable keys & values ---
expectType<ReadonlyMap<string, number>>(imm<Map<string, number>>());
expectAssignable<ReadonlyMap<readonly string[], { readonly x: number }>>(
  imm<Map<string[], { x: number }>>(),
);

// --- Set → ReadonlySet with deep immutable elements ---
expectType<ReadonlySet<number>>(imm<Set<number>>());
expectType<ReadonlySet<readonly string[]>>(imm<Set<string[]>>());

// --- Array → readonly array with deep immutable elements ---
expectType<readonly number[]>(imm<number[]>());
expectType<readonly (readonly string[])[]>(imm<string[][]>());

// --- Plain objects: recursively readonly (not class instances) ---
expectAssignable<{ readonly a: number; readonly b: string }>(
  imm<{ a: number; b: string }>(),
);
expectAssignable<{
  readonly id: number;
  readonly nested: { readonly name: string };
}>(imm<{ id: number; nested: { name: string } }>());

// --- Class instances are preserved (not recursively made readonly) ---
class Entity {
  constructor(public id: string) {}
}
expectType<Entity>(imm<Entity>());
expectAssignable<Entity>(imm<Entity>());

// --- After immutability, value is still typed as instance of the class ---
class AggregateRoot {
  constructor(
    public readonly id: string,
    public version: number,
  ) {}
  doSomething(): void {}
}
// DeepImmutable<AggregateRoot> must still be AggregateRoot (instance of it)
expectType<AggregateRoot>(imm<AggregateRoot>());
// Type-level "instanceof": immutable value is assignable where class is required
function acceptInstanceOfAggregateRoot(_instance: AggregateRoot): void {}
acceptInstanceOfAggregateRoot(imm<AggregateRoot>());

// --- Nested structures ---
type Nested = {
  arr: number[];
  map: Map<string, { value: number }>;
  set: Set<number[]>;
};
expectAssignable<{
  readonly arr: readonly number[];
  readonly map: ReadonlyMap<string, { readonly value: number }>;
  readonly set: ReadonlySet<readonly number[]>;
}>(imm<Nested>());

// --- Edge: empty object ---
expectType<{}>(imm<{}>());

// --- Edge: tuple is treated as array → readonly (number | string)[] ---
expectType<readonly (number | string)[]>(imm<[number, string]>());
