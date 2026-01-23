import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../../errors/entity-validation.error';
import { Entity, EntityProps } from '../entity';
import { UUID } from '../../value-objects/id.vo';

// Test implementations
interface UserProps {
  name: string;
  email: string;
}

class User extends Entity<UUID, UserProps> {
  constructor(params: EntityProps<UUID, UserProps>) {
    super(params);
  }

  public validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw EntityValidationError.create('Name is required');
    }
    if (!this.props.email || !this.props.email.includes('@')) {
      throw EntityValidationError.create('Valid email is required');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      name: this.props.name,
      email: this.props.email,
    };
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  public updateName(name: string): void {
    this.mutate(props => ({ ...props, name }));
  }
}

describe('Entity', () => {
  describe('constructor', () => {
    it('should create a valid entity', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(user.id).toBe(id);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should set createdAt to current date if not provided', () => {
      const id = UUID.generate();
      const before = new Date();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided createdAt', () => {
      const id = UUID.generate();
      const createdAt = new Date('2023-01-01');
      const user = new User({
        id,
        createdAt,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(user.createdAt).toEqual(createdAt);
    });

    it('should freeze props', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(() => {
        (user as any).props.name = 'Jane';
      }).toThrow();
    });

    it('should throw error if validation fails', () => {
      const id = UUID.generate();

      expect(() => {
        new User({
          id,
          props: { name: '', email: 'john@example.com' },
        });
      }).toThrow(EntityValidationError);

      expect(() => {
        new User({
          id,
          props: { name: 'John Doe', email: 'invalid-email' },
        });
      }).toThrow(EntityValidationError);
    });
  });

  describe('equals', () => {
    it('should return true for entities with same ID', () => {
      const id = UUID.generate();
      const user1 = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });
      const user2 = new User({
        id,
        props: { name: 'Jane Doe', email: 'jane@example.com' },
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const user1 = new User({
        id: UUID.generate(),
        props: { name: 'John Doe', email: 'john@example.com' },
      });
      const user2 = new User({
        id: UUID.generate(),
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return true for same instance', () => {
      const user = new User({
        id: UUID.generate(),
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(user.equals(user)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      const user = new User({
        id: UUID.generate(),
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      expect(user.equals(null)).toBe(false);
      expect(user.equals(undefined)).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should return object representation', () => {
      const id = UUID.generate();
      const createdAt = new Date('2023-01-01');
      const user = new User({
        id,
        createdAt,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      const obj = user.toObject();

      expect(obj).toEqual({
        id: id.toString(),
        createdAt: createdAt.toISOString(),
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('mutate', () => {
    it('should update props and revalidate', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      user.updateName('Jane Doe');

      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should freeze updated props', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      user.updateName('Jane Doe');

      expect(() => {
        (user as any).props.name = 'Bob';
      }).toThrow();
    });

    it('should throw error if validation fails after mutation', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      // Test through updateName with invalid name
      expect(() => {
        (user as any).mutate((props: UserProps) => ({ ...props, name: '' }));
      }).toThrow(EntityValidationError);
    });
  });

  describe('props getter', () => {
    it('should return readonly props', () => {
      const id = UUID.generate();
      const user = new User({
        id,
        props: { name: 'John Doe', email: 'john@example.com' },
      });

      const props = user['props'];

      expect(() => {
        (props as any).name = 'Jane';
      }).toThrow();
    });
  });
});
