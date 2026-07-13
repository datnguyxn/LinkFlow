import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';
import { UserRole } from '@prisma/client';
import { ERROR_CODE } from '../../../src/common/constants/index';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  describe('exchange', () => {
    const user = {
      id: 'user-id',
      email: 'dat@gmail.com',
      role: UserRole.USER,
      language: 'en',
    };

    it('should exchange refresh token successfully', async () => {
      fixture.jwtService.verifyRefreshToken.mockResolvedValue({
        id: user.id,
      });

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.jwtService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await fixture.authService.exchange('refresh-token');

      expect(fixture.jwtService.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');

      expect(fixture.userRepository.findById).toHaveBeenCalledWith(user.id);

      expect(fixture.jwtService.generateAccessToken).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        role: user.role,
        language: user.language,
      });

      expect(result).toEqual({
        accessToken: 'new-access-token',
        user,
      });
    });

    it('should throw if verifyRefreshToken failed', async () => {
      fixture.jwtService.verifyRefreshToken.mockRejectedValue(new Error('Invalid Refresh Token'));

      await expect(fixture.authService.exchange('refresh-token')).rejects.toThrow(
        'Invalid Refresh Token',
      );

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();

      expect(fixture.jwtService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      fixture.jwtService.verifyRefreshToken.mockResolvedValue({
        id: 'user-id',
      });

      fixture.userRepository.findById.mockResolvedValue(null);

      await expect(fixture.authService.exchange('refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_REFRESH_TOKEN,
      });

      expect(fixture.jwtService.generateAccessToken).not.toHaveBeenCalled();
    });

    it('should throw if generateAccessToken failed', async () => {
      fixture.jwtService.verifyRefreshToken.mockResolvedValue({
        id: user.id,
      });

      fixture.userRepository.findById.mockResolvedValue(user);

      fixture.jwtService.generateAccessToken.mockImplementation(() => {
        throw new Error('JWT Error');
      });

      await expect(fixture.authService.exchange('refresh-token')).rejects.toThrow('JWT Error');
    });
  });
});
