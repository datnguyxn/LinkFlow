import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/password.util', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

import { UserRole, UserStatus } from '@prisma/client';
import { ERROR_CODE } from '../../../src/common/constants';
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
    emailVerified: false,
    status: UserStatus.PENDING_VERIFICATION,
    language: 'en',
    role: UserRole.USER,
  };

  const verificationRecord = {
    id: 'verify-id',
    userId: user.id,
    verifyToken: 'verify-token',
    expiresAt: new Date(Date.now() + 60_000),
  };

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.update.mockResolvedValue(undefined);

      fixture.workspaceRepository.create.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.delete.mockResolvedValue(undefined);

      fixture.authPublisher.emailVerified.mockResolvedValue(undefined);

      vi.spyOn(fixture.authService, 'completeLogin').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome');

      expect(fixture.emailVerificationRepository.findByToken).toHaveBeenCalledWith('verify-token');

      expect(fixture.userRepository.findById).toHaveBeenCalledWith(user.id);

      expect(fixture.userRepository.update).toHaveBeenCalledWith(
        user.id,
        {
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
        expect.any(Object),
      );

      expect(fixture.workspaceRepository.create).toHaveBeenCalledWith({
        name: user.fullName,
        ownerId: user.id,
      },  expect.any(Object));

      expect(fixture.emailVerificationRepository.delete).toHaveBeenCalledWith(
        verificationRecord.id,
        expect.any(Object),
      );

      expect(fixture.authPublisher.emailVerified).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        ipAddress: '127.0.0.1',
      });

      expect(fixture.authService.completeLogin).toHaveBeenCalledWith(
        user,
        {
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome',
          rememberMe: false,
        },
        'password',
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
    it('should throw if verification token not found', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(null);

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_EMAIL_VERIFICATION_TOKEN,
      });

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw if verification token expired', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue({
        ...verificationRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      fixture.emailVerificationRepository.delete.mockResolvedValue(undefined);

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.EMAIL_VERIFICATION_TOKEN_EXPIRED,
      });
    });

    it('should delete expired verification token', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue({
        ...verificationRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      fixture.emailVerificationRepository.delete.mockResolvedValue(undefined);

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow();

      expect(fixture.emailVerificationRepository.delete).toHaveBeenCalledWith(
        verificationRecord.id,
      );
    });

    it('should throw if user not found', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.USER_UNAVAILABLE,
      });
    });

    it('should throw if transaction failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockRejectedValue(new Error('Transaction Error'));

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('Transaction Error');
    });

    it('should throw if update user failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockRejectedValue(new Error('Update User Error'));

        return callback({});
      });

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('Update User Error');
    });

    it('should throw if create workspace failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockResolvedValue(undefined);

        fixture.workspaceRepository.create.mockRejectedValue(new Error('Workspace Error'));

        return callback({});
      });

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('Workspace Error');
    });

    it('should throw if delete verification token failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        fixture.userRepository.update.mockResolvedValue(undefined);

        fixture.workspaceRepository.create.mockResolvedValue(undefined);

        fixture.emailVerificationRepository.delete.mockRejectedValue(
          new Error('Delete Token Error'),
        );

        return callback({});
      });

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('Delete Token Error');
    });

    it('should throw if publish email verified event failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.update.mockResolvedValue(undefined);

      fixture.workspaceRepository.create.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.delete.mockResolvedValue(undefined);

      fixture.authPublisher.emailVerified.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('RabbitMQ Error');
    });

    it('should throw if completeLogin failed', async () => {
      fixture.emailVerificationRepository.findByToken.mockResolvedValue(verificationRecord);

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.update.mockResolvedValue(undefined);

      fixture.workspaceRepository.create.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.delete.mockResolvedValue(undefined);

      fixture.authPublisher.emailVerified.mockResolvedValue(undefined);

      vi.spyOn(fixture.authService, 'completeLogin').mockRejectedValue(
        new Error('Complete Login Error'),
      );

      await expect(
        fixture.authService.verifyEmail('verify-token', '127.0.0.1', 'Chrome'),
      ).rejects.toThrow('Complete Login Error');
    });
  });
});
