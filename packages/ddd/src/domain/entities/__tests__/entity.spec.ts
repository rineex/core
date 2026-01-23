import { describe, expect, it } from 'vitest';

import { EntityValidationError } from '../../errors/entity-validation.error';
import { UUID } from '../../value-objects/id.vo';
import { Entity, EntityProps } from '../entity';

// Test implementations
interface UserProps {
  name: string;
  email: string;
}

class User extends Entity<UUID, UserProps> {
  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(params: EntityProps<UUID, UserProps>) {
    super(params);
  }

  public toObject(): Record<string, unknown> {
    return {
      createdAt: this.createdAt.toISOString(),
      email: this.props.email,
      id: this.id.toString(),
      name: this.props.name,
    };
  }

  public updateName(name: string): void {
    this.mutate(props => ({ ...props, name }));
  }

  public validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw EntityValidationError.create('Name is required');
    }
    if (!this.props.email || !this.props.email.includes('@')) {
      throw EntityValidationError.create('Valid email is required');
    }
  }
}

describe('entity', () => {
  describe('constructor', () => {
    it('should create a valid entity', () => {
      const id = UUID.generate();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });

      expect(user.id).toBe(id);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should set createdAt to current date if not provided', () => {
      const id = UUID.generate();
      const before = new Date();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided createdAt', () => {
      const id = UUID.generate();
      const createdAt = new Date('2023-01-01');
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        createdAt,
        id,
      });

      expect(user.createdAt).toEqual(createdAt);
    });

    it('should freeze props', () => {
      const id = UUID.generate();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });

      expect(() => {
        (user as any).props.name = 'Jane';
      }).toThrow('Cannot assign to read only property');
    });

    it('should throw error if validation fails', () => {
      const id = UUID.generate();

      expect(() => {
        // eslint-disable-next-line no-new
        new User({
          props: { email: 'john@example.com', name: '' },
          id,
        });
      }).toThrow(EntityValidationError);

      expect(() => {
        // eslint-disable-next-line no-new
        new User({
          props: { email: 'invalid-email', name: 'John Doe' },
          id,
        });
      }).toThrow(EntityValidationError);
    });
  });

  describe('equals', () => {
    it('should return true for entities with same ID', () => {
      const id = UUID.generate();
      const user1 = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });
      const user2 = new User({
        props: { email: 'jane@example.com', name: 'Jane Doe' },
        id,
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const user1 = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id: UUID.generate(),
      });
      const user2 = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id: UUID.generate(),
      });

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return true for same instance', () => {
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id: UUID.generate(),
      });

      expect(user.equals(user)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id: UUID.generate(),
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
        props: { email: 'john@example.com', name: 'John Doe' },
        createdAt,
        id,
      });

      const obj = user.toObject();

      expect(obj).toEqual({
        createdAt: createdAt.toISOString(),
        email: 'john@example.com',
        id: id.toString(),
        name: 'John Doe',
      });
    });
  });

  describe('mutate', () => {
    it('should update props and revalidate', () => {
      const id = UUID.generate();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });

      user.updateName('Jane Doe');

      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should freeze updated props', () => {
      const id = UUID.generate();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });

      user.updateName('Jane Doe');

      expect(() => {
        (user as any).props.name = 'Bob';
      }).toThrow('Cannot assign to read only property');
    });

    it('should throw error if validation fails after mutation', () => {
      const id = UUID.generate();
      const user = new User({
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
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
        props: { email: 'john@example.com', name: 'John Doe' },
        id,
      });

      const props = user['props'];

      expect(() => {
        (props as any).name = 'Jane';
      }).toThrow('Cannot assign to read only property');
    });
  });
});
