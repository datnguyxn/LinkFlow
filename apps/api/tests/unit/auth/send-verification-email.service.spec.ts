import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';
import { ERROR_CODE } from '../../../src/common/constants';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  const user = {
    id: 'user-id',
    email: 'dat@gmail.com',
    fullName: 'Dat Nguyen',
  };

  describe('sendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(user);

      fixture.authPublisher.verificationEmailResent.mockResolvedValue(undefined);

      const sendVerificationEmailSpy = vi
        .spyOn(fixture.authService as any, 'sendVerificationEmail')
        .mockResolvedValue(undefined);

      await fixture.authService.resendVerificationEmail(user.email, '127.0.0.1');

      expect(fixture.userRepository.findByEmail).toHaveBeenCalledWith(user.email);

      expect(fixture.authPublisher.verificationEmailResent).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        ipAddress: '127.0.0.1',
      });

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(user, '127.0.0.1');
    });

    it('should throw if user not found', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        fixture.authService.resendVerificationEmail('dat@gmail.com'),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: ERROR_CODE.USER_UNAVAILABLE,
      });

      expect(fixture.authPublisher.verificationEmailResent).not.toHaveBeenCalled();
    });

    it('should throw if publish verificationEmailResent failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(user);

      fixture.authPublisher.verificationEmailResent.mockRejectedValue(new Error('RabbitMQ Error'));

      const sendVerificationEmailSpy = vi.spyOn(
        fixture.authService as any,
        'sendVerificationEmail',
      );

      await expect(fixture.authService.resendVerificationEmail(user.email)).rejects.toThrow(
        'RabbitMQ Error',
      );

      expect(sendVerificationEmailSpy).not.toHaveBeenCalled();
    });

    it('should throw if sendVerificationEmail failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(user);

      fixture.authPublisher.verificationEmailResent.mockResolvedValue(undefined);

      vi.spyOn(fixture.authService as any, 'sendVerificationEmail').mockRejectedValue(
        new Error('Send Verification Error'),
      );

      await expect(fixture.authService.resendVerificationEmail(user.email)).rejects.toThrow(
        'Send Verification Error',
      );
    });
  });
});
