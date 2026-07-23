import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UserStatus } from '@prisma/client';
import { createAuthServiceFixture } from '../fixtures/auth.service.fixture';

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
    emailVerified: true,
    status: UserStatus.ACTIVE,
  };

  describe('forgotPassword', () => {
    it('should send reset password email successfully', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(user);

      const sendResetPasswordEmailSpy = vi
        .spyOn(fixture.authService as any, 'sendResetPasswordEmail')
        .mockResolvedValue(undefined);

      await fixture.authService.forgotPassword(user.email, '127.0.0.1');

      expect(fixture.userRepository.findByEmail).toHaveBeenCalledWith(user.email);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(user, '127.0.0.1');
    });

    it('should return when user not found', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(null);

      const sendResetPasswordEmailSpy = vi.spyOn(
        fixture.authService as any,
        'sendResetPasswordEmail',
      );

      await expect(fixture.authService.forgotPassword('dat@gmail.com')).resolves.toBeUndefined();

      expect(sendResetPasswordEmailSpy).not.toHaveBeenCalled();
    });

    it('should return when email not verified', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...user,
        emailVerified: false,
      });

      const sendResetPasswordEmailSpy = vi.spyOn(
        fixture.authService as any,
        'sendResetPasswordEmail',
      );

      await expect(fixture.authService.forgotPassword('dat@gmail.com')).resolves.toBeUndefined();

      expect(sendResetPasswordEmailSpy).not.toHaveBeenCalled();
    });

    it('should return when user is not ACTIVE', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...user,
        status: UserStatus.PENDING_VERIFICATION,
      });

      const sendResetPasswordEmailSpy = vi.spyOn(
        fixture.authService as any,
        'sendResetPasswordEmail',
      );

      await expect(fixture.authService.forgotPassword('dat@gmail.com')).resolves.toBeUndefined();

      expect(sendResetPasswordEmailSpy).not.toHaveBeenCalled();
    });

    it('should throw if sendResetPasswordEmail failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(user);

      vi.spyOn(fixture.authService as any, 'sendResetPasswordEmail').mockRejectedValue(
        new Error('Send Reset Password Error'),
      );

      await expect(fixture.authService.forgotPassword(user.email, '127.0.0.1')).rejects.toThrow(
        'Send Reset Password Error',
      );
    });
  });
});
