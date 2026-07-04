import type { ValueObject } from '../base/vo';

import type { EntityId } from './entity-id.type';

type JsonPrimitive = string | number | boolean;

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
      : T extends Date
        ? string
        : T extends bigint | symbol
          ? string
          : T extends (...args: any[]) => any
            ? string
            : T extends EntityId
              ? T['value']
              : T extends ValueObject<infer P>
                ? DeepPrimitive<P>
                : T extends { toJSON(): infer J }
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
export type EntityJson<ID extends EntityId, Props> = DeepPrimitive<
  Props & { createdAt: Date; id: ID['value'] }
>;
