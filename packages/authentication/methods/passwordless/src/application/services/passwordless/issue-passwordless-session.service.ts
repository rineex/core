import { ApplicationServicePort, Email } from '@rineex/ddd';

import { PasswordlessSessionRepository } from '@/ports/repositories/passwordless-session.repository';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';
import { PasswordlessSession } from '@/domain/aggregates/passwordless-session.aggregate';
import { OtpSenderPort } from '@/ports/services/otp-sender.port';
import { OtpCode } from '@/domain/value-objects';

type I = string;
type O = PasswordlessSession;

export class IssuePasswordlessSessionService implements ApplicationServicePort<
  I,
  O
> {
  constructor(
    private readonly repository: PasswordlessSessionRepository,
    private readonly otpSender: OtpSenderPort,
    private readonly idGenerator: IdGeneratorPort,
    private readonly clock: ClockPort,
  ) {}
  async execute(rawEmail: string): Promise<O> {
    const email = new Email(rawEmail);
    const now = this.clock.now();
    const otp = OtpCode.create(
      Math.floor(100000 + Math.random() * 900000).toString(),
    );
    const sessionId = PasswordlessChallengeId.create(
      this.idGenerator.generate(),
    );

    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    const session = PasswordlessSession.create({
      props: {
        issuedAt: now,
        expiresAt,
        email,
        channel: 'email',
        otp,
      },
      id: sessionId,
    });

    await this.repository.save(session);
    await this.otpSender.sendOtp(email.value, otp.value);

    return session;
  }
}
