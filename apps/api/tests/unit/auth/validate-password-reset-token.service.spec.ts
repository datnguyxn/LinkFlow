import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthServiceFixture } from './fixtures/auth-service.fixture';
import { ERROR_CODE } from '../../../src/common/constants';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  const resetRecord = {
    id: 'reset-id',
    userId: 'user-id',
    resetToken: 'reset-token',
    expiresAt: new Date(Date.now() + 60_000),
  };

  describe('validatePasswordResetToken', () => {
    it('should validate token successfully', async () => {
      fixture.passwordResetRepository.findByToken.mockResolvedValue(resetRecord);

      const result = await fixture.authService['validatePasswordResetToken']('reset-token');

      expect(fixture.passwordResetRepository.findByToken).toHaveBeenCalledWith('reset-token');

      expect(result).toEqual(resetRecord);
    });

    it('should throw if token not found', async () => {
      fixture.passwordResetRepository.findByToken.mockResolvedValue(null);

      await expect(
        fixture.authService['validatePasswordResetToken']('reset-token'),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.INVALID_PASSWORD_RESET_TOKEN,
      });

      expect(fixture.passwordResetRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete expired token', async () => {
      fixture.passwordResetRepository.findByToken.mockResolvedValue({
        ...resetRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      fixture.passwordResetRepository.delete.mockResolvedValue(undefined);

      await expect(
        fixture.authService['validatePasswordResetToken']('reset-token'),
      ).rejects.toThrow();

      expect(fixture.passwordResetRepository.delete).toHaveBeenCalledWith(resetRecord.id);
    });

    it('should throw if token expired', async () => {
      fixture.passwordResetRepository.findByToken.mockResolvedValue({
        ...resetRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      fixture.passwordResetRepository.delete.mockResolvedValue(undefined);

      await expect(
        fixture.authService['validatePasswordResetToken']('reset-token'),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: ERROR_CODE.PASSWORD_RESET_TOKEN_EXPIRED,
      });
    });
  });
});
