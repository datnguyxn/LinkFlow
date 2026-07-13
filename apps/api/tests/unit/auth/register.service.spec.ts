import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/password.util', () => ({
  hashPassword: vi.fn(),
}));

import { hashPassword } from '../../../src/utils/password.util';
import { UserStatus } from '@prisma/client';
import { ERROR_CODE } from '../../../src/common/constants/index';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  describe('registerUser', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should register successfully', async () => {
      const createdUser = {
        id: 'user-id',
        email: 'dat@gmail.com',
        fullName: 'Dat Nguyen',
      };

      fixture.userRepository.findByEmail.mockResolvedValue(null);

      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        const tx = {};

        fixture.userRepository.createUser.mockResolvedValue(createdUser);

        fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

        fixture.emailVerificationRepository.create.mockResolvedValue(undefined);

        return callback(tx);
      });

      fixture.authPublisher.userRegistered.mockResolvedValue(undefined);

      await fixture.authService.registerUser(
        'dat@gmail.com',
        'Password@123',
        'Dat Nguyen',
        '127.0.0.1',
      );

      expect(fixture.userRepository.findByEmail).toHaveBeenCalledWith('dat@gmail.com');

      expect(hashPassword).toHaveBeenCalledWith('Password@123');

      expect(fixture.transactionService.run).toHaveBeenCalledTimes(1);

      expect(fixture.userRepository.createUser).toHaveBeenCalledWith(
        {
          email: 'dat@gmail.com',
          passwordHash: 'hashed-password',
          fullName: 'Dat Nguyen',
          status: 'PENDING_VERIFICATION',
          language: 'en',
          timezone: 'UTC',
        },
        expect.any(Object),
      );

      expect(fixture.emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith(
        'user-id',
        expect.any(Object),
      );

      expect(fixture.emailVerificationRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user-id',
          verifyToken: expect.any(String),
        }),
      );

      expect(fixture.authPublisher.userRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          email: 'dat@gmail.com',
          fullName: 'Dat Nguyen',
          verifyToken: expect.any(String),
          ipAddress: '127.0.0.1',
        }),
      );
    });

    it('should throw USER_ALREADY_EXISTS', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        emailVerified: true,
        status: UserStatus.ACTIVE,
      });

      await expect(
        fixture.authService.registerUser('dat@gmail.com', '123', 'Dat'),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: ERROR_CODE.USER_ALREADY_EXISTS,
      });
    });

    it('should resend verification email', async () => {
      const pendingUser = {
        id: '1',
        email: 'dat@gmail.com',
        fullName: 'Dat',
        status: UserStatus.PENDING_VERIFICATION,
        emailVerified: false,
      };

      fixture.userRepository.findByEmail.mockResolvedValue(pendingUser);

      vi.spyOn(fixture.authService as any, 'sendVerificationEmail').mockResolvedValue(undefined);

      await fixture.authService.registerUser('dat@gmail.com', '123', 'Dat');

      expect(fixture.authService['sendVerificationEmail']).toHaveBeenCalledWith(
        pendingUser,
        undefined,
      );
    });

    it('should throw if createPendingUser failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(null);

      vi.spyOn(fixture.authService as any, 'createPendingUser').mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(fixture.authService.registerUser('dat@gmail.com', '123', 'Dat')).rejects.toThrow(
        'DB Error',
      );
    });

    it('should throw if publishVerificationEmail failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(null);

      vi.spyOn(fixture.authService as any, 'createPendingUser').mockResolvedValue({
        user: {
          id: '1',
          email: 'dat@gmail.com',
          fullName: 'Dat',
        },
        verifyToken: 'token',
      });

      fixture.authPublisher.userRegistered.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(fixture.authService.registerUser('dat@gmail.com', '123', 'Dat')).rejects.toThrow(
        'RabbitMQ Error',
      );
    });
  });

  describe('createPendingUser', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const createdUser = {
      id: 'user-id',
      email: 'dat@gmail.com',
      fullName: 'Dat Nguyen',
    };

    it('should create pending user successfully', async () => {
      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.createUser.mockResolvedValue(createdUser);

      fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.create.mockResolvedValue(undefined);

      const result = await fixture.authService['createPendingUser'](
        'dat@gmail.com',
        'Password@123',
        'Dat Nguyen',
      );

      expect(hashPassword).toHaveBeenCalledWith('Password@123');

      expect(fixture.transactionService.run).toHaveBeenCalled();

      expect(fixture.userRepository.createUser).toHaveBeenCalledWith(
        {
          email: 'dat@gmail.com',
          passwordHash: 'hashed-password',
          fullName: 'Dat Nguyen',
          status: 'PENDING_VERIFICATION',
          language: 'en',
          timezone: 'UTC',
        },
        expect.any(Object),
      );

      expect(fixture.emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith(
        'user-id',
        expect.any(Object),
      );

      expect(fixture.emailVerificationRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'user-id',
          verifyToken: expect.any(String),
        }),
      );

      expect(result.user).toEqual(createdUser);
      expect(result.verifyToken).toEqual(expect.any(String));
    });

    it('should throw if hashPassword failed', async () => {
      (hashPassword as any).mockRejectedValue(new Error('Hash Error'));

      await expect(
        fixture.authService['createPendingUser']('dat@gmail.com', 'Password@123', 'Dat'),
      ).rejects.toThrow('Hash Error');

      expect(fixture.transactionService.run).not.toHaveBeenCalled();
    });

    it('should throw if transaction failed', async () => {
      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockRejectedValue(new Error('Transaction Error'));

      await expect(
        fixture.authService['createPendingUser']('dat@gmail.com', 'Password@123', 'Dat'),
      ).rejects.toThrow('Transaction Error');
    });

    it('should throw if createUser failed', async () => {
      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.createUser.mockRejectedValue(new Error('Create User Error'));

      await expect(
        fixture.authService['createPendingUser']('dat@gmail.com', 'Password@123', 'Dat'),
      ).rejects.toThrow('Create User Error');

      expect(fixture.emailVerificationRepository.deleteByUserId).not.toHaveBeenCalled();
    });

    it('should throw if delete verification token failed', async () => {
      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.createUser.mockResolvedValue(createdUser);

      fixture.emailVerificationRepository.deleteByUserId.mockRejectedValue(
        new Error('Delete Token Error'),
      );

      await expect(
        fixture.authService['createPendingUser']('dat@gmail.com', 'Password@123', 'Dat'),
      ).rejects.toThrow('Delete Token Error');

      expect(fixture.emailVerificationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if create verification token failed', async () => {
      (hashPassword as any).mockResolvedValue('hashed-password');

      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.userRepository.createUser.mockResolvedValue(createdUser);

      fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.create.mockRejectedValue(new Error('Create Token Error'));

      await expect(
        fixture.authService['createPendingUser']('dat@gmail.com', 'Password@123', 'Dat'),
      ).rejects.toThrow('Create Token Error');
    });
  });

  describe('sendVerificationEmail', () => {
    const user = {
      id: 'user-id',
      email: 'dat@gmail.com',
      fullName: 'Dat Nguyen',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should resend verification email successfully', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.create.mockResolvedValue(undefined);

      fixture.authPublisher.userRegistered.mockResolvedValue(undefined);

      await fixture.authService['sendVerificationEmail'](user, '127.0.0.1');

      expect(fixture.transactionService.run).toHaveBeenCalledTimes(1);

      expect(fixture.emailVerificationRepository.deleteByUserId).toHaveBeenCalledWith(
        user.id,
        expect.any(Object),
      );

      expect(fixture.emailVerificationRepository.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: user.id,
          verifyToken: expect.any(String),
        }),
      );

      expect(fixture.authPublisher.userRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          verifyToken: expect.any(String),
          ipAddress: '127.0.0.1',
        }),
      );
    });

    it('should throw if transaction failed', async () => {
      fixture.transactionService.run.mockRejectedValue(new Error('Transaction Error'));

      await expect(fixture.authService['sendVerificationEmail'](user, '127.0.0.1')).rejects.toThrow(
        'Transaction Error',
      );
    });

    it('should throw if delete verification token failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.emailVerificationRepository.deleteByUserId.mockRejectedValue(
        new Error('Delete Token Error'),
      );

      await expect(fixture.authService['sendVerificationEmail'](user, '127.0.0.1')).rejects.toThrow(
        'Delete Token Error',
      );

      expect(fixture.emailVerificationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if create verification token failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.create.mockRejectedValue(new Error('Create Token Error'));

      await expect(fixture.authService['sendVerificationEmail'](user, '127.0.0.1')).rejects.toThrow(
        'Create Token Error',
      );
    });

    it('should throw if publisher failed', async () => {
      fixture.transactionService.run.mockImplementation(async (callback: any) => {
        return callback({});
      });

      fixture.emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

      fixture.emailVerificationRepository.create.mockResolvedValue(undefined);

      fixture.authPublisher.userRegistered.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(fixture.authService['sendVerificationEmail'](user, '127.0.0.1')).rejects.toThrow(
        'RabbitMQ Error',
      );

      expect(fixture.authPublisher.userRegistered).toHaveBeenCalledTimes(1);
    });
  });
});
