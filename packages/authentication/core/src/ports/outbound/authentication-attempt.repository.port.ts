import { AuthenticationAttempt } from '@/domain/aggregates/authentication-attempt.aggregate';

/**
 * Persistence port for authentication attempts.
 *
 * Implementation is infrastructure-specific.
 */
export type AuthenticationAttemptRepositoryPort = {
  save: (attempt: AuthenticationAttempt) => Promise<void>;
  findById: (id: string) => Promise<AuthenticationAttempt | null>;
};
