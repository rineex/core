import { Identity } from '@/domain/identity/aggregates/identity.aggregate';
import { IdentityId } from '@/domain';

export interface IdentityRepository {
  get: (id: IdentityId) => Promise<Identity | null>;
  save: (identity: Identity) => Promise<void>;
}
