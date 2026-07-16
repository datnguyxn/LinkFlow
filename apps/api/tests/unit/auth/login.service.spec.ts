import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../src/utils/password.util', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

import { comparePassword } from '../../../src/utils/password.util';
import { UserRole, UserStatus } from '@prisma/client';
import { ERROR_CODE } from '../../../src/common/constants';
import { config } from '../../../src/config/env';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  describe('loginUser', () => {
    const activeUser = {
      id: 'user-id',
      email: 'dat@gmail.com',
      passwordHash: 'hashed-password',
      fullName: 'Dat Nguyen',
      language: 'en',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should login successfully', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(activeUser);

      (comparePassword as any).mockResolvedValue(true);

      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      const completeLoginSpy = vi.spyOn(fixture.authService, 'completeLogin').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await fixture.authService.loginUser('dat@gmail.com', 'Password@123', options);

      expect(fixture.userRepository.findByEmail).toHaveBeenCalledWith('dat@gmail.com');

      expect(comparePassword).toHaveBeenCalledWith('Password@123', 'hashed-password');

      expect(completeLoginSpy).toHaveBeenCalledWith(activeUser, options, 'password');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw INVALID_CREDENTIALS when user does not exist', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw when email is not verified', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...activeUser,
        emailVerified: false,
      });

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw when user is inactive', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...activeUser,
        status: UserStatus.INACTIVE,
      });

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: ERROR_CODE.USER_INACTIVE,
      });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw when user is suspended', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...activeUser,
        status: UserStatus.SUSPENDED,
      });

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: ERROR_CODE.USER_SUSPENDED,
      });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw when user is deleted', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue({
        ...activeUser,
        status: UserStatus.DELETED,
      });

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: ERROR_CODE.USER_DELETED,
      });

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw INVALID_CREDENTIALS when password is incorrect', async () => {
      const completeLoginSpy = vi.spyOn(fixture.authService, 'completeLogin');

      fixture.userRepository.findByEmail.mockResolvedValue(activeUser);

      (comparePassword as any).mockResolvedValue(false);

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'WrongPassword', {}),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });

      expect(completeLoginSpy).not.toHaveBeenCalled();
    });

    it('should throw if completeLogin failed', async () => {
      fixture.userRepository.findByEmail.mockResolvedValue(activeUser);

      (comparePassword as any).mockResolvedValue(true);

      vi.spyOn(fixture.authService, 'completeLogin').mockRejectedValue(
        new Error('Complete Login Error'),
      );

      await expect(
        fixture.authService.loginUser('dat@gmail.com', 'Password@123', {}),
      ).rejects.toThrow('Complete Login Error');
    });
  });

  describe('completeLogin', () => {
    const user = {
      id: 'user-id',
      email: 'dat@gmail.com',
      fullName: 'Dat Nguyen',
      language: 'en',
      role: UserRole.USER,
    } as any;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should complete login successfully', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockResolvedValue({});

      fixture.userRepository.updateLastLogin.mockResolvedValue(undefined);

      fixture.authPublisher.userLoggedIn.mockResolvedValue(undefined);

      const result = await fixture.authService.completeLogin(user, options, 'password');

      expect(fixture.jwtService.generateAccessToken).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        role: user.role,
        language: 'en',
      });

      expect(fixture.jwtService.generateRefreshToken).toHaveBeenCalledWith(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          language: 'en',
        },
        expect.anything(),
      );

      expect(fixture.jwtService.hashRefreshToken).toHaveBeenCalledWith('refresh-token');

      expect(fixture.refreshTokenRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        token: expect.objectContaining({
          tokenHash: 'hashed-refresh-token',
          expiresAt: expect.any(Date),
          user: {
            connect: {
              id: user.id,
            },
          },
        }),
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
        rememberMe: true,
      });

      expect(fixture.userRepository.updateLastLogin).toHaveBeenCalledWith(user.id);

      expect(fixture.authPublisher.userLoggedIn).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        method: 'password',
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should generate remember refresh token when rememberMe is true', async () => {
      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockResolvedValue({});

      fixture.userRepository.updateLastLogin.mockResolvedValue(undefined);

      fixture.authPublisher.userLoggedIn.mockResolvedValue(undefined);

      await fixture.authService.completeLogin(
        user,
        {
          rememberMe: true,
        },
        'password',
      );

      expect(fixture.jwtService.generateRefreshToken).toHaveBeenCalledWith(
        expect.any(Object),
        config.JWT_REFRESH_REMEMBER_EXPIRES_IN,
      );
    });

    it('should generate normal refresh token when rememberMe is false', async () => {
      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockResolvedValue({});

      fixture.userRepository.updateLastLogin.mockResolvedValue(undefined);

      fixture.authPublisher.userLoggedIn.mockResolvedValue(undefined);

      await fixture.authService.completeLogin(
        user,
        {
          rememberMe: false,
        },
        'password',
      );

      expect(fixture.jwtService.generateRefreshToken).toHaveBeenCalledWith(
        expect.any(Object),
        config.JWT_REFRESH_EXPIRES_IN,
      );
    });

    it('should throw if jwt generation failed', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockRejectedValue(new Error('JWT Error'));

      await expect(fixture.authService.completeLogin(user, options, 'password')).rejects.toThrow(
        'JWT Error',
      );

      expect(fixture.refreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if hash refresh token failed', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockRejectedValue(new Error('Hash Refresh Error'));

      await expect(fixture.authService.completeLogin(user, options, 'password')).rejects.toThrow(
        'Hash Refresh Error',
      );

      expect(fixture.refreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if refresh token repository failed', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockRejectedValue(new Error('Refresh Token Error'));

      await expect(fixture.authService.completeLogin(user, options, 'password')).rejects.toThrow(
        'Refresh Token Error',
      );

      expect(fixture.userRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should throw if update last login failed', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockResolvedValue({});

      fixture.userRepository.updateLastLogin.mockRejectedValue(
        new Error('Update Last Login Error'),
      );

      await expect(fixture.authService.completeLogin(user, options, 'password')).rejects.toThrow(
        'Update Last Login Error',
      );

      expect(fixture.authPublisher.userLoggedIn).not.toHaveBeenCalled();
    });

    it('should throw if publisher failed', async () => {
      const options = {
        rememberMe: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome',
      };

      fixture.jwtService.generateAccessToken.mockResolvedValue('access-token');

      fixture.jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');

      fixture.refreshTokenRepository.create.mockResolvedValue({});

      fixture.userRepository.updateLastLogin.mockResolvedValue(undefined);

      fixture.authPublisher.userLoggedIn.mockRejectedValue(new Error('RabbitMQ Error'));

      await expect(fixture.authService.completeLogin(user, options, 'password')).rejects.toThrow(
        'RabbitMQ Error',
      );
    });
  });
});
