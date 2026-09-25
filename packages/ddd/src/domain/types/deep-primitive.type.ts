import { Simplify } from 'type-fest';

import type { ValueObject } from '../base/vo';

import type { EntityId } from './entity-id.type';

type JsonPrimitive = boolean | number | string;

type JsonIdValue<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : DeepPrimitive<T>;

/**
 * Recursively maps T to JSON-safe primitive values.
 * Mirrors {@link Entity.normalize} runtime behavior.
 */
export type DeepPrimitive<T> = T extends null
  ? null
  : T extends undefined
    ? undefined
    : T extends JsonPrimitive
      ? T
      : T extends string
        ? string
        : T extends number
          ? number
          : T extends boolean
            ? boolean
            : T extends Date
              ? string
              : T extends bigint | symbol
                ? string
                : T extends (...args: any[]) => any
                  ? string
                  : T extends EntityId
                    ? JsonIdValue<T['value']>
                    : T extends ValueObject<infer P>
                      ? DeepPrimitive<P>
                      : T extends { toJSON: () => infer J }
                        ? DeepPrimitive<J>
                        : T extends readonly (infer U)[]
                          ? DeepPrimitive<U>[]
                          : T extends Map<any, any> | Set<any>
                            ? Record<string, never>
                            : T extends object
                              ? { [K in keyof T]: DeepPrimitive<T[K]> }
                              : string;

/**
 * JSON-safe shape returned by {@link Entity.toJSON}.
 */
export type EntityJson<ID extends EntityId, Props extends object> = Simplify<
  Omit<DeepPrimitive<Props>, 'createdAt' | 'id'> & {
    createdAt: string;
    id: JsonIdValue<ID['value']>;
  }
>;
