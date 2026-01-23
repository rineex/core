import { SessionToken } from '@/domain/token/value-objects/session-token.vo';
import { SessionId } from '@/domain/session/value-objects/session-id.vo';
import { Session } from '@/domain/session/entities/session.entity';

export type SessionRepositoryPort = {
  save: (session: Session) => Promise<void>;
  findById: (id: SessionId) => Promise<Session | null>;
  findByToken: (token: SessionToken) => Promise<Session | null>;
};
