import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';
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
    it('should send reset password email successfully', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.passwordResetRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.passwordResetRepository.create.mockResolvedValue(undefined);

      fixture.authPublisher.passwordResetRequested.mockResolvedValue(undefined);

      await fixture.authService['sendResetPasswordEmail'](user, '127.0.0.1');

      expect(fixture.transactionService.run).toHaveBeenCalledTimes(1);

      expect(fixture.passwordResetRepository.deleteByUserId).toHaveBeenCalledWith(
        user.id,
        expect.any(Object),
      );

      expect(fixture.passwordResetRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: user.id,
          resetToken: expect.any(String),
        }),
      );

      expect(fixture.authPublisher.passwordResetRequested).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        resetToken: expect.any(String),
        ipAddress: '127.0.0.1',
      });
    });

    it('should throw if transaction failed', async () => {
      fixture.transactionService.run.mockRejectedValue(new Error('Transaction Error'));

      await expect(
        fixture.authService['sendResetPasswordEmail'](user, '127.0.0.1'),
      ).rejects.toThrow('Transaction Error');

      expect(fixture.authPublisher.passwordResetRequested).not.toHaveBeenCalled();
    });

    it('should throw if delete old reset token failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.passwordResetRepository.deleteByUserId.mockRejectedValue(
          new Error('Delete Reset Token Error'),
        );

        return callback({});
      });

      await expect(
        fixture.authService['sendResetPasswordEmail'](user, '127.0.0.1'),
      ).rejects.toThrow('Delete Reset Token Error');
    });

    it('should throw if create reset token failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.passwordResetRepository.deleteByUserId.mockResolvedValue(undefined);

        fixture.passwordResetRepository.create.mockRejectedValue(
          new Error('Create Reset Token Error'),
        );

        return callback({});
      });

      await expect(
        fixture.authService['sendResetPasswordEmail'](user, '127.0.0.1'),
      ).rejects.toThrow('Create Reset Token Error');
    });

    it('should throw if publisher failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.passwordResetRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.passwordResetRepository.create.mockResolvedValue(undefined);

      fixture.authPublisher.passwordResetRequested.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(
        fixture.authService['sendResetPasswordEmail'](user, '127.0.0.1'),
      ).rejects.toThrow('RabbitMQ Error');
    });
  });
});
