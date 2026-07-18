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

    userService = new UserService(userRepository, storageService, oauthRepository);
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
    it('should update user profile successfully', async () => {
      const existingUser = {
        id: '1',
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

      const result = await userService.updateProfile('1', updateData);

      expect(result).toEqual(updatedUser);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith('1');

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        userService.updateProfile('1', {
          fullName: 'John Updated',
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      await expect(
        userService.updateProfile('1', {
          fullName: 'John Updated',
        }),
      ).rejects.toThrow('user.userNotFound');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      const existingUser = {
        id: '1',
        fullName: 'John Doe',
      };

      const updateData = {
        fullName: 'John Updated',
      };

      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(userService.updateProfile('1', updateData)).rejects.toThrow('Database error');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.update).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const user = {
        id: '1',
        passwordHash: 'old-hash',
      };

      userRepository.findById.mockResolvedValue(user);

      vi.mocked(comparePassword)
        .mockResolvedValueOnce(true) // old password đúng
        .mockResolvedValueOnce(false); // new password khác old

      vi.mocked(hashPassword).mockResolvedValue('new-hash');

      userRepository.update.mockResolvedValue({
        ...user,
        passwordHash: 'new-hash',
      });

      const result = await userService.changePassword('1', 'old-password', 'new-password');

      expect(comparePassword).toHaveBeenNthCalledWith(1, 'old-password', 'old-hash');

      expect(comparePassword).toHaveBeenNthCalledWith(2, 'new-password', 'old-hash');

      expect(hashPassword).toHaveBeenCalledWith('new-password');

      expect(userRepository.update).toHaveBeenCalledWith('1', {
        passwordHash: 'new-hash',
      });

      expect(result.passwordHash).toBe('new-hash');
    });

    it('should throw when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.changePassword('1', 'old', 'new')).rejects.toBeInstanceOf(
        ConflictError,
      );

      expect(comparePassword).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when old password is incorrect', async () => {
      userRepository.findById.mockResolvedValue({
        id: '1',
        passwordHash: 'old-hash',
      });

      vi.mocked(comparePassword).mockResolvedValue(false);

      await expect(
        userService.changePassword('1', 'wrong-password', 'new-password'),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when new password is the same as old password', async () => {
      userRepository.findById.mockResolvedValue({
        id: '1',
        passwordHash: 'old-hash',
      });

      vi.mocked(comparePassword)
        .mockResolvedValueOnce(true) // old password đúng
        .mockResolvedValueOnce(true); // new password giống old

      await expect(
        userService.changePassword('1', 'old-password', 'old-password'),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate hash password errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: '1',
        passwordHash: 'old-hash',
      });

      vi.mocked(comparePassword)
        .mockResolvedValueOnce(true) // old password đúng
        .mockResolvedValueOnce(false); // new password khác old

      vi.mocked(hashPassword).mockRejectedValue(new Error('Hash failed'));

      await expect(userService.changePassword('1', 'old', 'new')).rejects.toThrow('Hash failed');

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      userRepository.findById.mockResolvedValue({
        id: '1',
        passwordHash: 'old-hash',
      });

      vi.mocked(comparePassword)
        .mockResolvedValueOnce(true) // old password đúng
        .mockResolvedValueOnce(false); // new password khác old

      vi.mocked(hashPassword).mockResolvedValue('new-hash');

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(userService.changePassword('1', 'old', 'new')).rejects.toThrow('Database error');
    });
  });

  describe('deleteMyAccount', () => {
    it('should delete user account successfully', async () => {
      const user = {
        id: '1',
        fullName: 'John Doe',
        status: UserStatus.ACTIVE,
      };

      const updatedUser = {
        ...user,
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.deleteMyAccount('1');

      expect(result).toEqual(updatedUser);

      expect(userRepository.findById).toHaveBeenCalledWith('1');

      expect(userRepository.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw ConflictError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteMyAccount('1')).rejects.toBeInstanceOf(ConflictError);

      await expect(userService.deleteMyAccount('1')).rejects.toThrow('user.userNotFound');

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when update returns null', async () => {
      const user = {
        id: '1',
        fullName: 'John Doe',
      };

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(null);

      await expect(userService.deleteMyAccount('1')).rejects.toBeInstanceOf(ConflictError);

      await expect(userService.deleteMyAccount('1')).rejects.toThrow('user.userNotFound');

      expect(userRepository.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should propagate repository update errors', async () => {
      const user = {
        id: '1',
      };

      userRepository.findById.mockResolvedValue(user);

      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(userService.deleteMyAccount('1')).rejects.toThrow('Database error');

      expect(userRepository.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: UserStatus.DELETED,
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('uploadAvatar', () => {
    const avatarFile = {
      filename: 'avatar.png',
      mimetype: 'image/png',
    } as any;

    beforeEach(() => {
      vi.mocked(validateAvatar).mockResolvedValue(Buffer.from('fake-image-data'));
    });

    it('should upload avatar successfully', async () => {
      const user = {
        id: 'user-id',
        avatarUrl: null,
      };

      userRepository.findById.mockResolvedValue(user);

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'avatar/user-id/file.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      const result = await userService.uploadAvatar('user-id', avatarFile);

      expect(userRepository.findById).toHaveBeenCalledWith('user-id');

      expect(storageService.uploadFile).toHaveBeenCalled();

      expect(userRepository.update).toHaveBeenCalledWith('user-id', {
        avatarUrl: 'avatar/user-id/file.png',
      });

      expect(result).toEqual({
        objectKey: 'avatar/user-id/file.png',
      });
    });

    it('should delete old avatar after upload', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: 'old-avatar.png',
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new-avatar.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      storageService.deleteFile.mockResolvedValue(undefined);

      await userService.uploadAvatar('user-id', avatarFile);

      expect(storageService.deleteFile).toHaveBeenCalledWith('old-avatar.png');
    });

    it('should throw if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.uploadAvatar('user-id', avatarFile)).rejects.toMatchObject({
        code: ERROR_CODE.NOT_FOUND,
      });
    });

    it('should throw if validate avatar failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: null,
      });

      vi.mocked(validateAvatar).mockRejectedValue(new Error('Invalid Avatar'));

      await expect(userService.uploadAvatar('user-id', avatarFile)).rejects.toThrow(
        'Invalid Avatar',
      );
    });

    it('should throw if upload file failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: null,
      });

      storageService.uploadFile.mockRejectedValue(new Error('Upload Error'));

      await expect(userService.uploadAvatar('user-id', avatarFile)).rejects.toThrow('Upload Error');
    });

    it('should throw if update avatar failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: null,
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'avatar.png',
      });

      userRepository.update.mockRejectedValue(new Error('DB Error'));

      await expect(userService.uploadAvatar('user-id', avatarFile)).rejects.toThrow('DB Error');
    });

    it('should throw if delete old avatar failed', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        avatarUrl: 'old.png',
      });

      storageService.uploadFile.mockResolvedValue({
        objectKey: 'new.png',
      });

      userRepository.update.mockResolvedValue(undefined);

      storageService.deleteFile.mockRejectedValue(new Error('Delete Error'));

      await expect(userService.uploadAvatar('user-id', avatarFile)).rejects.toMatchObject({
        code: ERROR_CODE.FILE_DELETE_FAILED,
      });
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
