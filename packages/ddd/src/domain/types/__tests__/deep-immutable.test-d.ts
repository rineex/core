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

// --- Property-only class instances are recursively readonly ---
class Entity {
  constructor(public id: string) {}
}
expectType<{ readonly id: string }>(imm<Entity>());

// --- Methods are preserved while instance properties become readonly ---
class AggregateRoot {
  constructor(
    public readonly id: string,
    public version: number,
  ) {}
  doSomething(): void {}
}
expectType<{
  readonly id: string;
  readonly version: number;
  readonly doSomething: () => void;
}>(imm<AggregateRoot>());

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

// --- Edge: tuples retain their readonly shape ---
expectType<readonly [number, string]>(imm<[number, string]>());
