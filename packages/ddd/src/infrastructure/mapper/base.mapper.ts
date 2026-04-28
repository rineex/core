import {
  DomainMapper,
  ExtractId,
  ExtractProps,
} from '@/domain/types/mapper.type';
import { Entity, EntityProps } from '@/domain/entities';

/**
 * Abstract base class for mapping domain entities to persistence models and vice versa.
 * @template Domain - The type of the domain entity.
 * @template Persistence - The type of the persistence model.
 * @template ResponseDTO - The type of the response Data Transfer Object (DTO).
 * @template CreateInput - The type of input for creating the entity.
 */
export abstract class BaseMapper<
  Domain extends Entity<any, any>,
  Persistence extends object,
  ResponseDTO = unknown,
  CreateInput = unknown,
> implements DomainMapper<Domain, Persistence, ResponseDTO, CreateInput> {
  /**
   * Transforms the persistence model to a domain entity.
   * @param {Persistence} raw - The persistence model to transform.
   * @returns {Domain} The mapped domain entity.
   */
  abstract toDomain(raw: Persistence): Domain;

  // Optional bulk operations
  /**
   * Transforms a list of persistence models to domain entities.
   * @param {Persistence[]} rawList - The list of persistence models to transform.
   * @returns {Domain[]} The mapped domain entities.
   */
  toDomainList(rawList: Persistence[]): Domain[] {
    return rawList.map(raw => this.toDomain(raw));
  }

  /**
   * Converts input data to domain properties for the entity.
   * @param {CreateInput} input - The input data used to create domain properties.
   * @returns {EntityProps<ExtractId<Domain>, ExtractProps<Domain>>} The domain properties.
   */
  abstract toDomainProps(
    input: CreateInput,
  ): EntityProps<ExtractId<Domain>, ExtractProps<Domain>>;

  /**
   * Transforms a domain entity to a Data Transfer Object (DTO).
   * @param {Domain} entity - The domain entity to transform.
   * @returns {ResponseDTO} The mapped DTO.
   */
  abstract toDTO(entity: Domain): ResponseDTO;

  /**
   * Transforms a list of domain entities to Data Transfer Objects (DTOs).
   * @param {Domain[]} entities - The list of domain entities to transform.
   * @returns {ResponseDTO[]} The mapped DTOs.
   */
  toDTOList(entities: Domain[]): ResponseDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Converts a domain entity to its persistence model.
   * @param {Domain} entity - The domain entity to convert.
   * @returns {Persistence} The persistence model.
   */
  abstract toPersistence(entity: Domain): Persistence;

  /**
   * Converts a list of domain entities to their persistence models.
   * @param {Domain[]} entities - The list of domain entities to convert.
   * @returns {Persistence[]} The persistence models.
   */
  toPersistenceList(entities: Domain[]): Persistence[] {
    return entities.map(entity => this.toPersistence(entity));
  }
}
