import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createAuthServiceFixture } from './fixtures/auth-service.fixture';

vi.mock('@/utils/user-agent', () => ({
  parseUserAgent: vi.fn(() => ({
    device: 'Desktop',
    os: 'Windows',
    browser: 'Chrome',
  })),
}));

describe('AuthService', () => {
  let fixture: ReturnType<typeof createAuthServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createAuthServiceFixture();
  });
  describe('findAllSessions', () => {
    it('should return active sessions with parsed user agent', async () => {
      const userId = 'user-123';

      fixture.refreshTokenRepository.findActiveByUserId.mockResolvedValue([
        {
          id: 'session-1',
          userId,
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome',
          expiresAt: new Date('2026-12-01'),
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await fixture.authService.findAllSessions(userId, 'session-1');

      expect(fixture.refreshTokenRepository.findActiveByUserId).toHaveBeenCalledWith(userId);

      expect(result).toEqual([
        {
          current: true,
          id: 'session-1',
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome',
          device: 'Desktop',
          os: 'Unknown',
          browser: 'Unknown',
          expiresAt: new Date('2026-12-01'),
          createdAt: new Date('2026-01-01'),
        },
      ]);
    });

    it('should return empty array when user has no active sessions', async () => {
      const userId = 'user-123';

      fixture.refreshTokenRepository.findActiveByUserId.mockResolvedValue([]);

      const result = await fixture.authService.findAllSessions(userId, 'session-1');

      expect(result).toEqual([]);

      expect(fixture.refreshTokenRepository.findActiveByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle session without user agent', async () => {
      const userId = 'user-123';

      fixture.refreshTokenRepository.findActiveByUserId.mockResolvedValue([
        {
          id: 'session-1',
          userId,
          ipAddress: '127.0.0.1',
          userAgent: null,
          expiresAt: new Date('2026-12-01'),
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await fixture.authService.findAllSessions(userId, 'session-1');

      expect(result[0]).toMatchObject({
        current: true,
        id: 'session-1',
        ipAddress: '127.0.0.1',
        userAgent: null,
      });

      expect(result[0].device).toBeDefined();
      expect(result[0].os).toBeDefined();
      expect(result[0].browser).toBeDefined();
    });

    it('should mark only current session as current', async () => {
      fixture.refreshTokenRepository.findActiveByUserId.mockResolvedValue([
        {
          id: 'session-1',
          userAgent: 'Chrome',
          ipAddress: '1.1.1.1',
          expiresAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'session-2',
          userAgent: 'Firefox',
          ipAddress: '2.2.2.2',
          expiresAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const result = await fixture.authService.findAllSessions('user-1', 'session-2');

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'session-1',
            current: false,
          }),
          expect.objectContaining({
            id: 'session-2',
            current: true,
          }),
        ]),
      );
    });
  });
});
