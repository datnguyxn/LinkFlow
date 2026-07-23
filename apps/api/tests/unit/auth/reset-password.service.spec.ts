import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/password.util', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

import { comparePassword, hashPassword } from '../../../src/utils/password.util';
import { ERROR_CODE } from '../../../src/common/constants';
import { createAuthServiceFixture } from '../fixtures/auth.service.fixture';
import { UnauthorizedError } from '../../../src/common/errors';

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
    passwordHash: 'old-password-hash',
  };

  const resetRecord = {
    id: 'reset-id',
    userId: user.id,
    resetToken: 'reset-token',
    expiresAt: new Date(Date.now() + 60_000),
  };

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('new-password-hash');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.update.mockResolvedValue(undefined);

      fixture.passwordResetRepository.delete.mockResolvedValue(undefined);

      fixture.refreshTokenRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.authPublisher.passwordResetSuccess.mockResolvedValue(undefined);

      await fixture.authService.resetPassword('reset-token', 'NewPassword@123', '127.0.0.1');

      expect(comparePassword).toHaveBeenCalledWith('NewPassword@123', user.passwordHash);

      expect(hashPassword).toHaveBeenCalledWith('NewPassword@123');

      expect(fixture.userRepository.update).toHaveBeenCalledWith(
        user.id,
        {
          passwordHash: 'new-password-hash',
        },
        expect.any(Object),
      );

      expect(fixture.passwordResetRepository.delete).toHaveBeenCalledWith(resetRecord.id);

      expect(fixture.refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(
        user.id,
        expect.any(Object),
      );

      expect(fixture.authPublisher.passwordResetSuccess).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        ipAddress: '127.0.0.1',
      });
    });

    it('should throw if reset token invalid', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockRejectedValue(
        new UnauthorizedError('invalid', ERROR_CODE.INVALID_PASSWORD_RESET_TOKEN),
      );

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toMatchObject({
        code: ERROR_CODE.INVALID_PASSWORD_RESET_TOKEN,
      });
    });

    it('should throw if user not found', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toMatchObject({
        code: ERROR_CODE.USER_UNAVAILABLE,
      });
    });

    it('should throw if new password is same as old', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(true);

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toMatchObject({
        code: ERROR_CODE.PASSWORD_SAME_AS_OLD,
      });
    });

    it('should throw if hashPassword failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockRejectedValue(new Error('Hash Password Error'));

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('Hash Password Error');
    });

    it('should throw if transaction failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockRejectedValue(new Error('Transaction Error'));

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('Transaction Error');
    });

    it('should throw if update password failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockRejectedValue(new Error('Update Password Error'));

        return callback({});
      });

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('Update Password Error');
    });

    it('should throw if delete reset token failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockResolvedValue(undefined);

        fixture.passwordResetRepository.delete.mockRejectedValue(
          new Error('Delete Reset Token Error'),
        );

        return callback({});
      });

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('Delete Reset Token Error');
    });

    it('should throw if revoke refresh token failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockResolvedValue(undefined);

        fixture.passwordResetRepository.delete.mockResolvedValue(undefined);

        fixture.refreshTokenRepository.deleteByUserId.mockRejectedValue(
          new Error('Revoke Refresh Token Error'),
        );

        return callback({});
      });

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('Revoke Refresh Token Error');
    });

    it('should throw if publisher failed', async () => {
      vi.spyOn(fixture.authService as any, 'validatePasswordResetToken').mockResolvedValue(
        resetRecord,
      );

      fixture.userRepository.findById.mockResolvedValue(user);

      (comparePassword as any).mockResolvedValue(false);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.update.mockResolvedValue(undefined);

      fixture.passwordResetRepository.delete.mockResolvedValue(undefined);

      fixture.refreshTokenRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.authPublisher.passwordResetSuccess.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(
        fixture.authService.resetPassword('reset-token', 'Password@123'),
      ).rejects.toThrow('RabbitMQ Error');
    });
  });
});
