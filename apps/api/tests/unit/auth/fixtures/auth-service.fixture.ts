import { vi } from 'vitest';

import { AuthService } from '../../../../src/modules/auth/service/auth.service';
import { UserRepository } from '../../../../src/modules/users';
import { WorkspaceRepository } from '../../../../src/modules/workspace';
import { RefreshTokenRepository } from '../../../../src/modules/refresh-token';
import { JwtService } from '../../../../src/modules/auth/service/jwt.service';
import { TransactionService } from '../../../../src/infrastructure/database';
import { EmailVerificationRepository } from '../../../../src/modules/email-verification';
import { PasswordResetRepository } from '../../../../src/modules/password-reset';
import { AuthPublisher } from '../../../../src/publishers/auth/auth.publisher';

export function createAuthServiceFixture() {
  const userRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
    update: vi.fn(),
    updateLastLogin: vi.fn(),
  };

  const workspaceRepository = {
    create: vi.fn(),
  };

  const refreshTokenRepository = {
    create: vi.fn(),
    deleteByUserId: vi.fn(),
    findByTokenHash: vi.fn(),
    revoke: vi.fn(),
    findByUserIdAndRevoked: vi.fn(),
    findActiveByIdAndUserId: vi.fn(),
    findActiveByUserId: vi.fn(),
    revokeAllByUserId: vi.fn(),
    revokeAllByUserIdExcept: vi.fn(),
  };

  const jwtService = {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn(),
    generateTokens: vi.fn(),
  };

  const transactionService = {
    run: vi.fn(),
  };

  const emailVerificationRepository = {
    create: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
    findByToken: vi.fn(),
  };

  const passwordResetRepository = {
    create: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
    findByToken: vi.fn(),
  };

  const authPublisher = {
    userRegistered: vi.fn(),
    userLoggedIn: vi.fn(),
    emailVerified: vi.fn(),
    verificationEmailResent: vi.fn(),
    passwordResetRequested: vi.fn(),
    passwordResetSuccess: vi.fn(),
  };

  const authService = new AuthService(
    userRepository as unknown as UserRepository,
    workspaceRepository as unknown as WorkspaceRepository,
    refreshTokenRepository as unknown as RefreshTokenRepository,
    jwtService as unknown as JwtService,
    transactionService as unknown as TransactionService,
    emailVerificationRepository as unknown as EmailVerificationRepository,
    passwordResetRepository as unknown as PasswordResetRepository,
    authPublisher as unknown as AuthPublisher,
  );

  return {
    authService,

    userRepository,
    workspaceRepository,
    refreshTokenRepository,
    jwtService,
    transactionService,
    emailVerificationRepository,
    passwordResetRepository,
    authPublisher,
  };
}
