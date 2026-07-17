import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminUserService } from '../../../src/modules/admin/service/admin-user.service';
import { ConflictError } from '../../../src/common/errors';
import { UserRole, UserStatus } from '@prisma/client';
import { UserAction } from '../../../src/common/enums/user-action.enum';

describe('AdminUserService', () => {
  let adminUserService: AdminUserService;
  let userRepository: any;
  let refreshTokenRepository: any;
  let adminUserPublisher: any;
  let transactionService: any;
  let oauthRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    userRepository = {
      // Mock methods of UserRepository as needed
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    refreshTokenRepository = {
      // Mock methods of RefreshTokenRepository as needed
      revokeAllByUserId: vi.fn(),
    };

    adminUserPublisher = {
      // Mock methods of AdminUserPublisher as needed
      userAction: vi.fn(),
    };

    transactionService = {
      // Mock methods of TransactionService as needed
      run: vi.fn(),
    };

    oauthRepository = {
      // Mock methods of OAuthRepository as needed
      findByUserId: vi.fn(),
    };

    adminUserService = new AdminUserService(
      userRepository,
      refreshTokenRepository,
      adminUserPublisher,
      transactionService,
      oauthRepository,
    );
  });

  // Add your test cases here
  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const result = {
        data: [{ id: '1' }],
        total: 1,
      };

      userRepository.findAll.mockResolvedValue(result);

      const users = await adminUserService.getAllUsers(1, 10);

      expect(users).toEqual(result);

      expect(userRepository.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getUserById', () => {
    it('should return user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        fullName: 'John Doe',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      oauthRepository.findByUserId.mockResolvedValue([{ provider: 'GOOGLE' }]);

      const result = await adminUserService.getUserById('1');

      expect(result).toEqual({
        user: mockUser,
        provider: 'GOOGLE',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return LOCAL provider when user has no oauth provider', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      oauthRepository.findByUserId.mockResolvedValue([]);

      const result = await adminUserService.getUserById('1');

      expect(result).toEqual({
        user: mockUser,
        provider: 'LOCAL',
      });

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(adminUserService.getUserById('1')).rejects.toBeInstanceOf(ConflictError);

      await expect(adminUserService.getUserById('1')).rejects.toMatchObject({
        message: 'user.userNotFound',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should propagate user repository errors', async () => {
      const dbError = new Error('Database error');

      userRepository.findById.mockRejectedValue(dbError);

      await expect(adminUserService.getUserById('1')).rejects.toThrow('Database error');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should propagate oauth repository errors', async () => {
      const mockUser = {
        id: '1',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      oauthRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.getUserById('1')).rejects.toThrow('Database error');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });
  });

  describe('unbanUser', () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const ipAddress = '127.0.0.1';

    const tx = {} as any;

    const suspendedUser = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      status: UserStatus.SUSPENDED,
      role: UserRole.USER,
    };

    const activeUser = {
      ...suspendedUser,
      status: UserStatus.ACTIVE,
    };

    beforeEach(() => {
      vi.clearAllMocks();

      transactionService.run.mockImplementation(async (callback: any) => {
        return callback(tx);
      });
    });

    it('should unban user successfully', async () => {
      userRepository.findById.mockResolvedValue(suspendedUser);

      userRepository.update.mockResolvedValue(activeUser);

      oauthRepository.findByUserId.mockResolvedValue([
        {
          provider: 'GOOGLE',
        },
      ]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.unbanUser(userId, adminId, ipAddress);

      expect(result).toEqual({
        userUpdated: activeUser,
        provider: 'GOOGLE',
      });

      expect(transactionService.run).toHaveBeenCalledTimes(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        {
          status: UserStatus.ACTIVE,
        },
        tx,
      );

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
        event: UserAction.USER_ACTION,
        action: UserAction.UNBAN,
        email: suspendedUser.email,
        fullName: suspendedUser.fullName,
        adminId,
        targetUserId: userId,
        reason: 'User has been unbanned by admin',
        changes: {
          status: {
            oldValue: UserStatus.SUSPENDED,
            newValue: UserStatus.ACTIVE,
          },
        },
        timestamp: expect.any(Date),
        ipAddress,
      });
    });

    it('should return LOCAL provider when user has no oauth account', async () => {
      userRepository.findById.mockResolvedValue(suspendedUser);

      userRepository.update.mockResolvedValue(activeUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.unbanUser(userId, adminId);

      expect(result.provider).toBe('LOCAL');
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(adminUserService.unbanUser(userId, adminId)).rejects.toBeInstanceOf(
        ConflictError,
      );

      expect(transactionService.run).not.toHaveBeenCalled();

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when update failed', async () => {
      userRepository.findById.mockResolvedValue(suspendedUser);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.unbanUser(userId, adminId)).rejects.toThrow('Database error');

      expect(transactionService.run).toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when oauth lookup failed', async () => {
      userRepository.findById.mockResolvedValue(suspendedUser);

      userRepository.update.mockResolvedValue(activeUser);

      oauthRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.unbanUser(userId, adminId)).rejects.toThrow('Database error');

      expect(transactionService.run).toHaveBeenCalled();

      expect(userRepository.update).toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate publisher error', async () => {
      userRepository.findById.mockResolvedValue(suspendedUser);

      userRepository.update.mockResolvedValue(activeUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(adminUserService.unbanUser(userId, adminId)).rejects.toThrow('RabbitMQ error');

      expect(transactionService.run).toHaveBeenCalled();

      expect(userRepository.update).toHaveBeenCalled();

      expect(oauthRepository.findByUserId).toHaveBeenCalled();

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('banUser', () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const ipAddress = '127.0.0.1';

    const tx = {} as any;

    const activeUser = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
    };

    const suspendedUser = {
      ...activeUser,
      status: UserStatus.SUSPENDED,
    };

    beforeEach(() => {
      vi.clearAllMocks();

      transactionService.run.mockImplementation(async (callback: any) => {
        return callback(tx);
      });
    });

    it('should ban user successfully', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockResolvedValue(suspendedUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      oauthRepository.findByUserId.mockResolvedValue([{ provider: 'GOOGLE' }]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.banUser(userId, adminId, ipAddress);

      expect(result).toEqual({
        userUpdated: suspendedUser,
        provider: 'GOOGLE',
      });

      expect(transactionService.run).toHaveBeenCalledTimes(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        {
          status: UserStatus.SUSPENDED,
        },
        tx,
      );

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId, tx);

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
        event: UserAction.USER_ACTION,
        action: UserAction.BAN,
        email: activeUser.email,
        fullName: activeUser.fullName,
        adminId,
        targetUserId: userId,
        reason: 'User has been banned by admin',
        changes: {
          status: {
            oldValue: UserStatus.ACTIVE,
            newValue: UserStatus.SUSPENDED,
          },
        },
        timestamp: expect.any(Date),
        ipAddress,
      });
    });

    it('should return LOCAL provider when user has no oauth account', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockResolvedValue(suspendedUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.banUser(userId, adminId);

      expect(result).toEqual({
        userUpdated: suspendedUser,
        provider: 'LOCAL',
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(adminUserService.banUser(userId, adminId)).rejects.toBeInstanceOf(ConflictError);

      expect(transactionService.run).not.toHaveBeenCalled();

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(refreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when update failed', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.banUser(userId, adminId)).rejects.toThrow('Database error');

      expect(refreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when revoke refresh tokens failed', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockResolvedValue(suspendedUser);

      refreshTokenRepository.revokeAllByUserId.mockRejectedValue(new Error('Revoke error'));

      await expect(adminUserService.banUser(userId, adminId)).rejects.toThrow('Revoke error');

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when oauth lookup failed', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockResolvedValue(suspendedUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      oauthRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.banUser(userId, adminId)).rejects.toThrow('Database error');

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate publisher error', async () => {
      userRepository.findById.mockResolvedValue(activeUser);

      userRepository.update.mockResolvedValue(suspendedUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(adminUserService.banUser(userId, adminId)).rejects.toThrow('RabbitMQ error');

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeRole', () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const ipAddress = '127.0.0.1';

    const tx = {} as any;

    const mockUser = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    };

    const updatedUser = {
      ...mockUser,
      role: UserRole.ADMIN,
    };

    beforeEach(() => {
      vi.clearAllMocks();

      transactionService.run.mockImplementation(async (callback: any) => {
        return callback(tx);
      });
    });

    it('should change user role successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      userRepository.update.mockResolvedValue(updatedUser);

      oauthRepository.findByUserId.mockResolvedValue([
        {
          provider: 'GOOGLE',
        },
      ]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.changeRole(adminId, userId, 'ADMIN', ipAddress);

      expect(result).toEqual({
        userUpdated: updatedUser,
        provider: 'GOOGLE',
      });

      expect(transactionService.run).toHaveBeenCalledTimes(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        {
          role: UserRole.ADMIN,
        },
        tx,
      );

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
        event: UserAction.USER_ACTION,
        action: UserAction.CHANGE_ROLE,
        email: mockUser.email,
        fullName: mockUser.fullName,
        adminId,
        targetUserId: userId,
        reason: 'User role changed to ADMIN by admin',
        changes: {
          role: {
            oldValue: UserRole.USER,
            newValue: UserRole.ADMIN,
          },
        },
        timestamp: expect.any(Date),
        ipAddress,
      });
    });

    it('should return LOCAL provider when user has no oauth account', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      userRepository.update.mockResolvedValue(updatedUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.changeRole(adminId, userId, 'ADMIN');

      expect(result).toEqual({
        userUpdated: updatedUser,
        provider: 'LOCAL',
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(adminUserService.changeRole(adminId, userId, 'ADMIN')).rejects.toBeInstanceOf(
        ConflictError,
      );

      expect(transactionService.run).not.toHaveBeenCalled();

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when update failed', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.changeRole(adminId, userId, 'ADMIN')).rejects.toThrow(
        'Database error',
      );

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when oauth lookup failed', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      userRepository.update.mockResolvedValue(updatedUser);

      oauthRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.changeRole(adminId, userId, 'ADMIN')).rejects.toThrow(
        'Database error',
      );

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      userRepository.update.mockResolvedValue(updatedUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(adminUserService.changeRole(adminId, userId, 'ADMIN')).rejects.toThrow(
        'RabbitMQ error',
      );

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const ipAddress = '127.0.0.1';

    const tx = {} as any;

    const mockUser = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
    };

    beforeEach(() => {
      vi.clearAllMocks();

      transactionService.run.mockImplementation(async (callback) => {
        return callback(tx);
      });
    });

    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      userRepository.delete.mockResolvedValue(undefined);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      await adminUserService.deleteUser(userId, adminId, ipAddress);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(transactionService.run).toHaveBeenCalledTimes(1);

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledTimes(1);

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId, tx);

      expect(userRepository.delete).toHaveBeenCalledTimes(1);

      expect(userRepository.delete).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);

      expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
        event: UserAction.USER_ACTION,
        action: UserAction.DELETE,
        email: mockUser.email,
        fullName: mockUser.fullName,
        adminId,
        targetUserId: userId,
        reason: 'User has been deleted by admin',
        changes: {
          status: {
            oldValue: UserStatus.ACTIVE,
            newValue: UserStatus.DELETED,
          },
        },
        timestamp: expect.any(Date),
        ipAddress,
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const promise = adminUserService.deleteUser(userId, adminId);

      await expect(promise).rejects.toBeInstanceOf(ConflictError);

      await expect(promise).rejects.toThrow('user.userNotFound');

      expect(transactionService.run).not.toHaveBeenCalled();

      expect(refreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();

      expect(userRepository.delete).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate refresh token revoke errors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      refreshTokenRepository.revokeAllByUserId.mockRejectedValue(new Error('Revoke failed'));

      await expect(adminUserService.deleteUser(userId, adminId)).rejects.toThrow('Revoke failed');

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId, tx);

      expect(userRepository.delete).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate repository delete errors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      userRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(adminUserService.deleteUser(userId, adminId)).rejects.toThrow('Delete failed');

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId, tx);

      expect(userRepository.delete).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

      userRepository.delete.mockResolvedValue(undefined);

      adminUserPublisher.userAction.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(adminUserService.deleteUser(userId, adminId, ipAddress)).rejects.toThrow(
        'RabbitMQ error',
      );

      expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(userId, tx);

      expect(userRepository.delete).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreUser', () => {
    const userId = 'user-1';
    const adminId = 'admin-1';
    const ipAddress = '127.0.0.1';

    const tx = {} as any;

    const deletedUser = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    };

    const restoredUser = {
      ...deletedUser,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    };

    beforeEach(() => {
      vi.clearAllMocks();

      transactionService.run.mockImplementation(async (callback: any) => {
        return callback(tx);
      });

      oauthRepository.findByUserId.mockResolvedValue([]);
    });

    it('should restore user successfully', async () => {
      userRepository.findById.mockResolvedValue(deletedUser);

      userRepository.update.mockResolvedValue(restoredUser);

      adminUserPublisher.userAction.mockResolvedValue(undefined);

      const result = await adminUserService.restoreUser(userId, adminId, ipAddress);

      expect(result).toEqual({
        userUpdated: restoredUser,
        provider: 'LOCAL',
      });

      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(transactionService.run).toHaveBeenCalledTimes(1);

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        {
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        tx,
      );

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
        event: UserAction.USER_ACTION,
        action: UserAction.RESTORE,
        email: deletedUser.email,
        fullName: deletedUser.fullName,
        adminId,
        targetUserId: userId,
        reason: 'User has been restored by admin',
        changes: {
          status: {
            oldValue: UserStatus.DELETED,
            newValue: UserStatus.ACTIVE,
          },
        },
        timestamp: expect.any(Date),
        ipAddress,
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(adminUserService.restoreUser(userId, adminId)).rejects.toBeInstanceOf(
        ConflictError,
      );

      expect(transactionService.run).not.toHaveBeenCalled();

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when update failed', async () => {
      userRepository.findById.mockResolvedValue(deletedUser);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(adminUserService.restoreUser(userId, adminId)).rejects.toThrow('Database error');

      expect(transactionService.run).toHaveBeenCalled();

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should rollback when loading oauth provider failed', async () => {
      userRepository.findById.mockResolvedValue(deletedUser);

      userRepository.update.mockResolvedValue(restoredUser);

      oauthRepository.findByUserId.mockRejectedValue(new Error('OAuth error'));

      await expect(adminUserService.restoreUser(userId, adminId)).rejects.toThrow('OAuth error');

      expect(transactionService.run).toHaveBeenCalled();

      expect(userRepository.update).toHaveBeenCalled();

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith(userId, tx);

      expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      userRepository.findById.mockResolvedValue(deletedUser);

      userRepository.update.mockResolvedValue(restoredUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      adminUserPublisher.userAction.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(adminUserService.restoreUser(userId, adminId, ipAddress)).rejects.toThrow(
        'RabbitMQ error',
      );

      expect(transactionService.run).toHaveBeenCalled();

      expect(userRepository.update).toHaveBeenCalled();

      expect(oauthRepository.findByUserId).toHaveBeenCalled();

      expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
    });
  });
});
