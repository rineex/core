# DDD API Migration

The DDD primitives are being hardened with an intentional breaking change.

## Planned changes

- Base constructors no longer call overridable validation methods.
- Concrete entities and aggregates validate explicitly in creation and
  rehydration factories.
- `mutate` validates candidate state before committing it.
- Aggregate event recording becomes protected and checks aggregate identity.
- Domain events require explicit IDs and timestamps and no longer generate IDs
  through `node:crypto`.
- Event metadata and payload serialization become stricter and immutable.

## Migration shape

Before:

```ts
constructor(params: EntityProps<Id, Props>) {
  super(params);
}
```

After:

```ts
private constructor(params: EntityProps<Id, Props>) {
  super(params);
  this.validate();
}

static rehydrate(params: EntityProps<Id, Props>): Account {
  return new Account(params);
}
```

Creation factories may record creation events after construction. Rehydration
factories must not.
