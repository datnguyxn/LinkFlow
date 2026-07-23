import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../../src/modules/users/service/user.service';
import { ConflictError } from '../../../src/common/errors';

vi.mock('../../../src/utils/password.util', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../../src/modules/users/validator/image.validator', () => ({
  validateAvatar: vi.fn(),
}));

import { validateAvatar } from '../../../src/modules/users/validator/image.validator';
import { comparePassword, hashPassword } from '../../../src/utils/password.util';
import { ERROR_CODE } from '../../../src/common/constants';
import { UserStatus } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: any;
  let storageService: any;
  let oauthRepository: any;
  let userPublisher: any;

  beforeEach(() => {
    vi.clearAllMocks();

    userRepository = {
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    storageService = {
      uploadFile: vi.fn(),
      deleteFile: vi.fn(),
      getFileStream: vi.fn(),
      getFileMetadata: vi.fn(),
    };

    oauthRepository = {
      // Mock any methods you need for the OAuthRepository
      findByUserId: vi.fn(),
    };

    userPublisher = {
      userProfileUpdated: vi.fn(),
      userPasswordChanged: vi.fn(),
      userAccountDeleted: vi.fn(),
      userAvatarUpdated: vi.fn(),
    };

    userService = new UserService(userRepository, storageService, oauthRepository, userPublisher);
  });

  describe('getMyProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        fullName: 'John Doe',
      };

      userRepository.findById.mockResolvedValue(mockUser);

      oauthRepository.findByUserId.mockResolvedValue([
        {
          provider: 'GOOGLE',
        },
      ]);

      const result = await userService.getMyProfile('1');

      expect(result).toEqual({
        user: mockUser,
        provider: 'GOOGLE',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('1');

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return LOCAL when user has no oauth provider', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        fullName: 'John Doe',
      };

      userRepository.findById.mockResolvedValue(mockUser);

      oauthRepository.findByUserId.mockResolvedValue([]);

      const result = await userService.getMyProfile('1');

      expect(result).toEqual({
        user: mockUser,
        provider: 'LOCAL',
      });

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getMyProfile('1')).rejects.toBeInstanceOf(ConflictError);

      await expect(userService.getMyProfile('1')).rejects.toMatchObject({
        message: 'user.userNotFound',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('1');

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should propagate user repository errors', async () => {
      const dbError = new Error('Database error');

      userRepository.findById.mockRejectedValue(dbError);

      await expect(userService.getMyProfile('1')).rejects.toThrow('Database error');

      expect(userRepository.findById).toHaveBeenCalledWith('1');

      expect(oauthRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should propagate oauth repository errors', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        fullName: 'John Doe',
      };

      userRepository.findById.mockResolvedValue(mockUser);

      oauthRepository.findByUserId.mockRejectedValue(new Error('OAuth error'));

      await expect(userService.getMyProfile('1')).rejects.toThrow('OAuth error');

      expect(oauthRepository.findByUserId).toHaveBeenCalledWith('1');
    });
  });

  describe('updateProfile', () => {
    const userId = '1';
    const ipAddress = '127.0.0.1';

    it('should update user profile successfully', async () => {
      const existingUser = {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const updateData = {
        fullName: 'John Updated',
        avatarUrl: 'avatar.png',
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      userRepository.findById.mockResolvedValue(existingUser);

      userRepository.update.mockResolvedValue(updatedUser);

      userPublisher.userProfileUpdated.mockResolvedValue(undefined);

      const result = await userService.updateProfile(userId, updateData, ipAddress);

      expect(result).toEqual(updatedUser);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);

      expect(userPublisher.userProfileUpdated).toHaveBeenCalledTimes(1);

      expect(userPublisher.userProfileUpdated).toHaveBeenCalledWith({
        userId,
        changedFields: Object.keys(updateData),
        updatedAt: expect.any(Date),
        updatedBy: existingUser.fullName,
        ipAddress,
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const promise = userService.updateProfile(
        userId,
        {
          fullName: 'John Updated',
        },
        ipAddress,
      );

      await expect(promise).rejects.toBeInstanceOf(ConflictError);

      await expect(promise).rejects.toThrow('user.userNotFound');

      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(userPublisher.userProfileUpdated).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      const existingUser = {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const updateData = {
        fullName: 'John Updated',
      };

      userRepository.findById.mockResolvedValue(existingUser);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      const promise = userService.updateProfile(userId, updateData, ipAddress);

      await expect(promise).rejects.toThrow('Database error');

      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);

      expect(userPublisher.userProfileUpdated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      const existingUser = {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const updateData = {
        fullName: 'John Updated',
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      userRepository.findById.mockResolvedValue(existingUser);

      userRepository.update.mockResolvedValue(updatedUser);

      userPublisher.userProfileUpdated.mockRejectedValue(new Error('RabbitMQ error'));

      const promise = userService.updateProfile(userId, updateData, ipAddress);

      await expect(promise).rejects.toThrow('RabbitMQ error');

      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);

      expect(userPublisher.userProfileUpdated).toHaveBeenCalledWith({
        userId,
        changedFields: Object.keys(updateData),
        updatedAt: expect.any(Date),
        updatedBy: existingUser.fullName,
        ipAddress,
      });
    });
  });

  describe('changePassword', () => {
    const userId = '1';
    const ipAddress = '127.0.0.1';

    const user = {
      id: userId,
      passwordHash: 'old-hash',
      fullName: 'John Doe',
      email: 'john@example.com',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should change password successfully', async () => {
      const updatedUser = {
        ...user,
        passwordHash: 'new-hash',
      };

      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword)
        .mockResolvedValueOnce(true) // old password đúng
        .mockResolvedValueOnce(false); // new password khác old

      vi.mocked(hashPassword).mockResolvedValue('new-hash');

      userRepository.update.mockResolvedValue(updatedUser);

      userPublisher.userPasswordChanged.mockResolvedValue(undefined);

      const result = await userService.changePassword(
        userId,
        'old-password',
        'new-password',
        ipAddress,
      );

      expect(result).toEqual(updatedUser);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(comparePassword).toHaveBeenNthCalledWith(1, 'old-password', 'old-hash');

      expect(comparePassword).toHaveBeenNthCalledWith(2, 'new-password', 'old-hash');

      expect(hashPassword).toHaveBeenCalledWith('new-password');

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        passwordHash: 'new-hash',
      });

      expect(userPublisher.userPasswordChanged).toHaveBeenCalledWith({
        userId,
        changedBy: user.fullName,
        changedAt: expect.any(Date),
        ipAddress,
      });
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        userService.changePassword(userId, 'old-password', 'new-password', ipAddress),
      ).rejects.toBeInstanceOf(ConflictError);

      await expect(
        userService.changePassword(userId, 'old-password', 'new-password', ipAddress),
      ).rejects.toThrow('user.userNotFound');

      expect(comparePassword).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userPasswordChanged).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when old password is incorrect', async () => {
      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword).mockResolvedValue(false);

      await expect(
        userService.changePassword(userId, 'wrong-password', 'new-password', ipAddress),
      ).rejects.toThrow('user.oldPasswordIncorrect');

      expect(comparePassword).toHaveBeenCalledTimes(1);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userPasswordChanged).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when new password is the same as old password', async () => {
      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword).mockResolvedValueOnce(true).mockResolvedValueOnce(true);

      await expect(
        userService.changePassword(userId, 'old-password', 'old-password', ipAddress),
      ).rejects.toThrow('user.newPasswordSameAsOld');

      expect(comparePassword).toHaveBeenCalledTimes(2);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userPasswordChanged).not.toHaveBeenCalled();
    });

    it('should propagate hash password errors', async () => {
      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      vi.mocked(hashPassword).mockRejectedValue(new Error('Hash failed'));

      await expect(
        userService.changePassword(userId, 'old-password', 'new-password', ipAddress),
      ).rejects.toThrow('Hash failed');

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userPasswordChanged).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      vi.mocked(hashPassword).mockResolvedValue('new-hash');

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        userService.changePassword(userId, 'old-password', 'new-password', ipAddress),
      ).rejects.toThrow('Database error');

      expect(userPublisher.userPasswordChanged).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      const updatedUser = {
        ...user,
        passwordHash: 'new-hash',
      };

      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      vi.mocked(hashPassword).mockResolvedValue('new-hash');

      userRepository.update.mockResolvedValue(updatedUser);

      userPublisher.userPasswordChanged.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(
        userService.changePassword(userId, 'old-password', 'new-password', ipAddress),
      ).rejects.toThrow('RabbitMQ error');

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        passwordHash: 'new-hash',
      });

      expect(userPublisher.userPasswordChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteMyAccount', () => {
    const userId = '1';
    const ipAddress = '127.0.0.1';

    const user = {
      id: userId,
      email: 'john@example.com',
      fullName: 'John Doe',
      status: UserStatus.ACTIVE,
    };

    const updatedUser = {
      ...user,
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    };

    beforeEach(() => {
      vi.clearAllMocks();

      userPublisher.userAccountDeleted.mockResolvedValue(undefined);
    });

    it('should delete user account successfully', async () => {
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.deleteMyAccount(userId, ipAddress);

      expect(result).toEqual(updatedUser);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );

      expect(userPublisher.userAccountDeleted).toHaveBeenCalledTimes(1);

      expect(userPublisher.userAccountDeleted).toHaveBeenCalledWith({
        userId,
        deletedBy: user.fullName,
        deletedAt: expect.any(Date),
        ipAddress,
      });
    });

    it('should use email when user does not have fullName', async () => {
      const userWithoutFullName = {
        ...user,
        fullName: null,
      };

      userRepository.findById.mockResolvedValue(userWithoutFullName);
      userRepository.update.mockResolvedValue(updatedUser);

      await userService.deleteMyAccount(userId, ipAddress);

      expect(userPublisher.userAccountDeleted).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          deletedBy: user.email,
          ipAddress,
        }),
      );
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toBeInstanceOf(
        ConflictError,
      );

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toThrow(
        'user.userNotFound',
      );

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(userPublisher.userAccountDeleted).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when update returns null', async () => {
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(null);

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toBeInstanceOf(
        ConflictError,
      );

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toThrow(
        'user.userNotFound',
      );

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );

      expect(userPublisher.userAccountDeleted).not.toHaveBeenCalled();
    });

    it('should propagate repository find errors', async () => {
      userRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toThrow(
        'Database error',
      );

      expect(userRepository.update).not.toHaveBeenCalled();

      expect(userPublisher.userAccountDeleted).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      userRepository.findById.mockResolvedValue(user);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toThrow(
        'Database error',
      );

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );

      expect(userPublisher.userAccountDeleted).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      userPublisher.userAccountDeleted.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(userService.deleteMyAccount(userId, ipAddress)).rejects.toThrow(
        'RabbitMQ error',
      );

      expect(userRepository.update).toHaveBeenCalled();

      expect(userPublisher.userAccountDeleted).toHaveBeenCalledTimes(1);
    });

    it('should set ipAddress to null when ipAddress is not provided', async () => {
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      await userService.deleteMyAccount(userId, null);

      expect(userPublisher.userAccountDeleted).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          deletedBy: user.fullName,
          ipAddress: null,
        }),
      );
    });
  });

  describe('uploadAvatar', () => {
    const userId = 'user-id';
    const ipAddress = '127.0.0.1';

    const avatarFile = {
      filename: 'avatar.png',
      mimetype: 'image/png',
    } as any;

    beforeEach(() => {
      vi.clearAllMocks();

      vi.mocked(validateAvatar).mockResolvedValue(Buffer.from('fake-image-data'));

      userPublisher.userAvatarUpdated.mockResolvedValue(undefined);
    });

    it('should upload avatar successfully', async () => {
      const user = {
        id: userId,
        avatarUrl: null,
      };

      userRepository.findById.mockResolvedValue(user);

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'avatar/user-id/file.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      const result = await userService.uploadAvatar(userId, avatarFile, ipAddress);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);

      expect(validateAvatar).toHaveBeenCalledWith(avatarFile);

      expect(storageService.uploadFile).toHaveBeenCalledWith({
        folder: expect.any(String),
        fileName: expect.stringContaining('.png'),
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data'),
      });

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        avatarUrl: 'avatar/user-id/file.png',
      });

      expect(userPublisher.userAvatarUpdated).toHaveBeenCalledWith({
        userId,
        updatedBy: userId,
        updatedAt: expect.any(Date),
        ipAddress,
      });

      expect(result).toEqual({
        objectKey: 'avatar/user-id/file.png',
      });
    });

    it('should delete old avatar after uploading and updating the new avatar', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: 'old-avatar.png',
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new-avatar.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      storageService.deleteFile.mockResolvedValue(undefined);

      await userService.uploadAvatar(userId, avatarFile, ipAddress);

      expect(storageService.deleteFile).toHaveBeenCalledWith('old-avatar.png');

      expect(userPublisher.userAvatarUpdated).toHaveBeenCalled();
    });

    it('should not delete old avatar when user does not have one', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: null,
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new-avatar.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      await userService.uploadAvatar(userId, avatarFile, ipAddress);

      expect(storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toMatchObject({
        code: ERROR_CODE.NOT_FOUND,
      });

      expect(validateAvatar).not.toHaveBeenCalled();
      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userAvatarUpdated).not.toHaveBeenCalled();
    });

    it('should propagate avatar validation errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: null,
      });

      vi.mocked(validateAvatar).mockRejectedValue(new Error('Invalid Avatar'));

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toThrow(
        'Invalid Avatar',
      );

      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userAvatarUpdated).not.toHaveBeenCalled();
    });

    it('should propagate upload errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: null,
      });

      storageService.uploadFile.mockRejectedValue(new Error('Upload Error'));

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toThrow(
        'Upload Error',
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(userPublisher.userAvatarUpdated).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: null,
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'avatar.png',
      });

      userRepository.update.mockRejectedValue(new Error('DB Error'));

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toThrow(
        'DB Error',
      );

      expect(storageService.deleteFile).not.toHaveBeenCalled();
      expect(userPublisher.userAvatarUpdated).not.toHaveBeenCalled();
    });

    it('should throw FILE_DELETE_FAILED when deleting old avatar fails', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: 'old.png',
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      storageService.deleteFile.mockRejectedValue(new Error('Delete Error'));

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toMatchObject({
        code: ERROR_CODE.FILE_DELETE_FAILED,
      });

      expect(userPublisher.userAvatarUpdated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        avatarUrl: null,
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new-avatar.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      userPublisher.userAvatarUpdated.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(userService.uploadAvatar(userId, avatarFile, ipAddress)).rejects.toThrow(
        'RabbitMQ Error',
      );

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        avatarUrl: 'new-avatar.png',
      });

      expect(userPublisher.userAvatarUpdated).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMyAvatar', () => {
    it('should get avatar successfully', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: 'avatar.png',
      });

      const stream = {} as any;

      storageService.getFileStream.mockResolvedValue(stream);

      storageService.getFileMetadata.mockResolvedValue({
        contentType: 'image/png',
        contentLength: 123,
      });

      const result = await userService.getMyAvatar('user-id');

      expect(storageService.getFileStream).toHaveBeenCalledWith('avatar.png');

      expect(storageService.getFileMetadata).toHaveBeenCalledWith('avatar.png');

      expect(result).toEqual({
        stream,
        metadata: {
          contentType: 'image/png',
          contentLength: 123,
        },
      });
    });

    it('should throw if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getMyAvatar('user-id')).rejects.toMatchObject({
        code: ERROR_CODE.NOT_FOUND,
      });
    });

    it('should throw if get file stream failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: 'avatar.png',
      });

      storageService.getFileStream.mockRejectedValue(new Error('Storage Error'));

      await expect(userService.getMyAvatar('user-id')).rejects.toThrow('Storage Error');
    });

    it('should throw if get metadata failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: 'avatar.png',
      });

      storageService.getFileStream.mockResolvedValue({});

      storageService.getFileMetadata.mockRejectedValue(new Error('Metadata Error'));

      await expect(userService.getMyAvatar('user-id')).rejects.toThrow('Metadata Error');
    });
  });
});
