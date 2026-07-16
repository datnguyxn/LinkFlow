import { describe, it, expect, beforeEach, vi } from 'vitest';

import { UserRole } from '@prisma/client';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const ipAddress = '127.0.0.1';
      const userAgent = 'Chrome';

      const payload = {
        id: 'user-id',
      };

      const storedRefreshToken = {
        id: 'refresh-id',
        userId: 'user-id',
        tokenHash: 'old-token-hash',
        revoked: false,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const mockUser = {
        id: 'user-id',
        email: 'dat@gmail.com',
        passwordHash: 'hashed-password',
        language: 'en',
        timezone: 'UTC',
        role: UserRole.USER,
      };

      const generatedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      fixture.jwtService.verifyRefreshToken = vi.fn().mockReturnValue(payload);

      fixture.jwtService.hashRefreshToken = vi
        .fn()
        .mockResolvedValueOnce('old-token-hash')
        .mockResolvedValueOnce('new-token-hash');

      fixture.refreshTokenRepository.findByTokenHash = vi
        .fn()
        .mockResolvedValue(storedRefreshToken);

      fixture.userRepository.findById = vi.fn().mockResolvedValue(mockUser);

      fixture.jwtService.generateAccessToken = vi.fn().mockReturnValue(generatedTokens.accessToken);
      fixture.jwtService.generateRefreshToken = vi
        .fn()
        .mockReturnValue(generatedTokens.refreshToken);

      fixture.transactionService.run = vi.fn().mockImplementation(async (callback) => callback());

      fixture.refreshTokenRepository.create = vi.fn();

      fixture.refreshTokenRepository.revoke = vi.fn();

      const result = await fixture.authService.refresh(refreshToken, ipAddress, userAgent);

      expect(fixture.jwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);

      expect(fixture.jwtService.hashRefreshToken).toHaveBeenNthCalledWith(1, refreshToken);

      expect(fixture.refreshTokenRepository.findByTokenHash).toHaveBeenCalledWith('old-token-hash');

      expect(fixture.userRepository.findById).toHaveBeenCalledWith(mockUser.id);

      expect(fixture.jwtService.generateAccessToken).toHaveBeenCalled();

      expect(fixture.jwtService.hashRefreshToken).toHaveBeenNthCalledWith(
        2,
        generatedTokens.refreshToken,
      );

      expect(fixture.transactionService.run).toHaveBeenCalled();

      expect(result).toEqual(generatedTokens);
    });
  });

  it('should throw INVALID_REFRESH_TOKEN when jwt verification failed', async () => {
    fixture.jwtService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('Invalid Refresh Token');
    });

    await expect(
      fixture.authService.refresh('invalid-token', '127.0.0.1', 'Chrome'),
    ).rejects.toThrow('Invalid Refresh Token');

    expect(fixture.refreshTokenRepository.findByTokenHash).not.toHaveBeenCalled();
  });

  it('should throw INVALID_REFRESH_TOKEN when token not found', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-token');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(
      fixture.authService.refresh('refresh-token', '127.0.0.1', 'Chrome'),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should throw when refresh token revoked', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-token');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',

      revoked: true,

      expiresAt: new Date(Date.now() + 100000),
    });

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should throw REFRESH_TOKEN_EXPIRED', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-token');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',

      revoked: false,

      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toMatchObject({
      statusCode: 401,
      code: 'REFRESH_TOKEN_EXPIRED',
    });
  });

  it('should throw INVALID_REFRESH_TOKEN when user not found', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken.mockResolvedValue('hashed-token');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',

      revoked: false,

      expiresAt: new Date(Date.now() + 100000),
    });

    fixture.userRepository.findById.mockResolvedValue(null);

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toMatchObject({
      statusCode: 401,
      code: 'USER_UNAVAILABLE',
    });
  });

  it('should throw if generate tokens failed', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken.mockResolvedValueOnce('old-hash');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',

      revoked: false,

      expiresAt: new Date(Date.now() + 100000),
    });

    fixture.userRepository.findById.mockResolvedValue({
      id: 'user-id',

      email: 'dat@gmail.com',

      language: 'en',

      role: UserRole.USER,
    });

    fixture.jwtService.generateAccessToken.mockImplementation(() => {
      throw new Error('JWT Error');
    });

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toThrow('JWT Error');
  });

  it('should throw if hash refresh token failed', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken
      .mockResolvedValueOnce('old-hash')
      .mockRejectedValueOnce(new Error('Hash Error'));

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',

      revoked: false,

      expiresAt: new Date(Date.now() + 100000),
    });

    fixture.userRepository.findById.mockResolvedValue({
      id: 'user-id',

      email: 'dat@gmail.com',

      language: 'en',

      role: UserRole.USER,
    });

    fixture.jwtService.generateAccessToken.mockReturnValue('access');
    fixture.jwtService.generateRefreshToken.mockReturnValue('refresh');

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toThrow(
      'Hash Error',
    );
  });

  it('should throw if revoke refresh token failed', async () => {
    fixture.jwtService.verifyRefreshToken.mockReturnValue({
      id: 'user-id',
    });

    fixture.jwtService.hashRefreshToken
      .mockResolvedValueOnce('old-hash')
      .mockResolvedValueOnce('new-hash');

    fixture.refreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'refresh-id',
      revoked: false,
      expiresAt: new Date(Date.now() + 100000),
    });

    fixture.userRepository.findById.mockResolvedValue({
      id: 'user-id',
      email: 'dat@gmail.com',
      language: 'en',
      role: UserRole.USER,
    });

    fixture.jwtService.generateAccessToken.mockReturnValue('access');
    fixture.jwtService.generateRefreshToken.mockReturnValue('refresh');

    fixture.refreshTokenRepository.create.mockResolvedValue({});

    fixture.refreshTokenRepository.revoke.mockRejectedValue(new Error('Revoke Error'));

    fixture.transactionService.run.mockImplementation(async (callback: any) => callback({}));

    await expect(fixture.authService.refresh('refresh-token', '', '')).rejects.toThrow(
      'Revoke Error',
    );

    expect(fixture.transactionService.run).toHaveBeenCalled();
  });
});
