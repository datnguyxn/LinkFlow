import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createAuthServiceFixture } from '../fixtures/auth.service.fixture';

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });

  describe('logoutSession', () => {
    it('should revoke session successfully', async () => {
      const userId = 'user-123';
      const sessionId = 'session-123';
      const ipAddress = '127.0.0.1';

      const mockSession = {
        id: sessionId,
        userId,
        userAgent: 'Chrome',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      fixture.refreshTokenRepository.findActiveByIdAndUserId.mockResolvedValue(mockSession);

      fixture.refreshTokenRepository.revoke.mockResolvedValue(undefined);

      await fixture.authService.logoutSession(userId, sessionId, ipAddress);

      expect(fixture.refreshTokenRepository.findActiveByIdAndUserId).toHaveBeenCalledWith(
        sessionId,
        userId,
      );

      expect(fixture.refreshTokenRepository.revoke).toHaveBeenCalledWith(sessionId);
    });

    it('should throw UnauthorizedError when session does not exist', async () => {
      const userId = 'user-123';
      const sessionId = 'session-invalid';
      const ipAddress = '127.0.0.1';

      fixture.refreshTokenRepository.findActiveByIdAndUserId.mockResolvedValue(null);

      await expect(fixture.authService.logoutSession(userId, sessionId, ipAddress)).rejects.toThrow();

      expect(fixture.refreshTokenRepository.revoke).not.toHaveBeenCalled();
    });
  });

  describe('logoutAllOtherSessions', () => {
    it('should revoke all active sessions of user except the specified session', async () => {
      const userId = 'user-123';
      const sessionId = 'session-123';
      const ipAddress = '127.0.0.1';

      fixture.refreshTokenRepository.revokeAllByUserIdExcept.mockResolvedValue(undefined);

      await fixture.authService.logoutAllOtherSessions(userId, sessionId, ipAddress);

      expect(fixture.refreshTokenRepository.revokeAllByUserIdExcept).toHaveBeenCalledWith(
        userId,
        sessionId,
      );
    });
  });
});
