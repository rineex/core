import { Entity, EntityProps } from '../entities';

export interface DomainMapper<
  Domain extends Entity<any, any>,
  Persistence extends object,
  ResponseDTO = unknown,
  CreateInput = unknown,
> {
  toDomain: (raw: unknown | Persistence) => Domain;
  toPersistence: (entity: Domain) => Persistence;
  toDTO: (entity: Domain) => ResponseDTO;
  toDomainProps: (
    input: CreateInput,
  ) => EntityProps<ExtractId<Domain>, ExtractProps<Domain>>;
}

// Type helpers
export type ExtractId<T> = T extends Entity<infer ID, any> ? ID : never;
export type ExtractProps<T> = T extends Entity<any, infer P> ? P : never;
