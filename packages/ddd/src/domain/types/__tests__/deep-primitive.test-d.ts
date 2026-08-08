/* eslint-disable vitest/require-hook */
import { expectAssignable, expectType } from 'tsd';

import { DomainID } from '@/domain/value-objects/domain-id.vo';

import type { DeepPrimitive, EntityJson } from '../deep-primitive.type';
import type { EntityProps } from '../../entities/entity';
import type { EntityId } from '../entity-id.type';
import { Entity } from '../../entities/entity';
import { ValueObject } from '../../base/vo';

function prim<T>(): DeepPrimitive<T> {
  return undefined as unknown as DeepPrimitive<T>;
}

// --- Primitives remain as-is ---
expectType<string>(prim<string>());
expectType<number>(prim<number>());
expectType<boolean>(prim<boolean>());
expectType<null>(prim<null>());
expectType<undefined>(prim<undefined>());

// --- Non-JSON primitives become string ---
expectType<string>(prim<symbol>());
expectType<string>(prim<() => void>());

// --- Date → ISO string ---
expectType<string>(prim<Date>());

// --- EntityId → primitive ---
expectType<string>(prim<DomainID>());

// --- Arrays recurse ---
expectType<string[]>(prim<Date[]>());
expectType<number[]>(prim<number[]>());
expectAssignable<{ name: string; age: number }[]>(
  prim<{ name: string; age: number }[]>(),
);

// --- Plain objects recurse ---
expectAssignable<{ a: number; b: string }>(prim<{ a: number; b: string }>());
expectAssignable<{
  id: number;
  nested: { name: string };
}>(prim<{ id: number; nested: { name: string } }>());

// --- Date fields in objects become string ---
expectAssignable<{ createdAt: string; name: string }>(
  prim<{ createdAt: Date; name: string }>(),
);

// --- ValueObject unwraps to deep primitive of props ---
class Email extends ValueObject<{ address: string }> {
  protected validate(): void {}
}
expectAssignable<{ address: string }>(prim<Email>());

// --- toJSON hook ---
class JsonSerializable {
  toJSON(): { value: number } {
    return { value: 1 };
  }
}
expectAssignable<{ value: number }>(prim<JsonSerializable>());

// --- Map / Set → empty object ---
expectType<Record<string, never>>(prim<Map<string, number>>());
expectType<Record<string, never>>(prim<Set<number>>());

// --- Class without toJSON → empty object ---
class PlainClass {
  constructor(private readonly id: string) {}
}
expectType<{}>(prim<PlainClass>());

// --- EntityJson shape ---
interface UserProps {
  name: string;
  email: string;
}

type UserJson = EntityJson<DomainID, UserProps>;
expectAssignable<{
  name: string;
  email: string;
  createdAt: string;
  id: string;
}>(undefined as unknown as UserJson);

// --- Entity.toJSON() returns structural type, not Record ---
class User extends Entity<DomainID, UserProps> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(params: EntityProps<DomainID, UserProps>) {
    super(params);
  }

  public toObject(): Record<string, unknown> {
    return {};
  }

  protected validateProps(_props: UserProps): void {}
}

declare const user: User;
const json = user.toJSON();

expectType<string>(json.name);
expectType<string>(json.email);
expectType<string>(json.createdAt);
expectType<string>(json.id);

expectAssignable<{
  name: string;
  email: string;
  createdAt: string;
  id: string;
}>(json);

// Structural keys are known — not erased to Record<string, unknown>
function acceptUserJson(value: {
  name: string;
  email: string;
  createdAt: string;
  id: string;
}): void {}
acceptUserJson(json);

// EntityId interface value type
interface TestId extends EntityId {
  readonly value: string;
}
expectType<string>(prim<TestId>());
