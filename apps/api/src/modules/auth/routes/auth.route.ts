import { AuthController } from '../controller/auth.controller.ts';
import type { FastifyInstance } from 'fastify';
import { validate } from '../../../utils/validator.util.ts';
import { registerSchema, type RegisterBody } from '../validator/register.validator.ts';
import {
  registerSwagger,
  loginSwagger,
  refreshTokenSwagger,
  logoutSwagger,
  forgotPasswordSwagger,
  resetPasswordSwagger,
  resetPasswordValidateSwagger,
  resendVerificationEmailSwagger,
  verifyEmailSwagger,
} from '../../../swaggers/index.ts';
import { loginSchema, type LoginBody } from '../validator/login.validator.ts';
import {
  resetPasswordSchema,
  type ResetPasswordBody,
} from '../validator/reset-password.validator.ts';

// Initialize controller instance
const controller = new AuthController();

/**
 * Authentication routes
 */
export const authRoutes = async (app: FastifyInstance) => {
  /**
   * POST /register
   *
   * Features:
   * - Request body validation using Zod
   * - Rate limiting to prevent abuse
   * - User registration
   */
  app.post<{ Body: RegisterBody }>(
    '/register',
    {
      // Limit registration attempts
      config: {
        rateLimit: {
          max: 5, // Maximum 5 requests
          timeWindow: '1 minute', // Per minute
        },
      },

      // Validate request body before reaching controller
      preValidation: [validate(registerSchema)],

      schema: registerSwagger, // Swagger documentation for this route,
    },

    // Bind controller context
    controller.registerUser.bind(controller),
  );

  /**
   * POST /login
   *
   * Features:
   * - Request body validation using Zod
   * - Rate limiting to prevent abuse
   * - User login
   */
  app.post<{ Body: LoginBody }>(
    '/login',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(loginSchema)], // Validate request body before reaching controller
      schema: loginSwagger, // Swagger documentation for this route
    },
    controller.loginUser.bind(controller), // Bind controller context
  );

  /**
   * GET /refresh-token
   *
   * Features:
   * - Refresh access token using refresh token from cookies
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/refresh-token',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: refreshTokenSwagger, // Swagger documentation for this route
    },
    controller.refreshToken.bind(controller), // Bind controller context
  );

  /**
   * GET /logout
   *
   * Features:
   * - Logout user by revoking refresh token
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/logout',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: logoutSwagger, // Swagger documentation for this route
    },
    controller.logoutUser.bind(controller), // Bind controller context
  );

  /**
   * GET /google
   *
   * Features:
   * - Initiates Google OAuth 2.0 login flow
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/google',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.loginWithGoogle.bind(controller), // Bind controller context,
  );

  /**
   * GET /google/callback
   *
   * Features:
   * - Handles Google OAuth 2.0 callback
   * - Exchanges authorization code for tokens
   * - Logs in or registers the user
   * - Rate limiting to prevent abuse
   * - Helmet configuration to allow inline scripts for Google login
   */
  app.get(
    '/google/callback',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      helmet: {
        contentSecurityPolicy: {
          directives: {
            'script-src': ["'self'", "'unsafe-inline'"],
          },
        },
        crossOriginOpenerPolicy: false,
      },
    },
    controller.googleCallback.bind(controller), // Bind controller context,
  );

  /**
   * GET /exchange
   *
   * Features:
   * - Exchanges refresh token for new access token
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/exchange',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.exchange.bind(controller), // Bind controller context,
  );

  /**
   * GET /verify-email
   *
   * Features:
   * - Verifies user's email using a token
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/verify-email',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: verifyEmailSwagger, // Swagger documentation for this route
    },
    controller.verifyEmail.bind(controller), // Bind controller context,
  );

  /**
   * POST /resend-verification-email
   *
   * Features:
   * - Resends email verification link to the user
   * - Rate limiting to prevent abuse
   */
  app.post(
    '/resend-verification-email',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: resendVerificationEmailSwagger, // Swagger documentation for this route
    },
    controller.resendVerificationEmail.bind(controller), // Bind controller context,
  );

  /**
   * POST /forgot-password
   *
   * Features:
   * - Initiates password reset process by sending a reset link to the user's email
   * - Rate limiting to prevent abuse
   */
  app.post(
    '/forgot-password',
    {
      config: {
        rateLimit: {
          max: 3, // Maximum 3 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: forgotPasswordSwagger, // Swagger documentation for this route
    },
    controller.forgotPassword.bind(controller), // Bind controller context
  );

  /**
   * GET /reset-password/validate
   *
   * Features:
   * - Validates the password reset token
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/reset-password/validate',
    {
      config: {
        rateLimit: {
          max: 1, // Maximum 3 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: resetPasswordValidateSwagger, // Swagger documentation for this route
    },
    controller.validateResetPassword.bind(controller), // Bind controller context
  );

  /**
   * POST /reset-password
   *
   * Features:
   * - Resets the user's password using a valid reset token
   * - Rate limiting to prevent abuse
   */
  app.post<{ Querystring: { token: string }; Body: ResetPasswordBody }>(
    '/reset-password',
    {
      config: {
        rateLimit: {
          max: 3, // Maximum 3 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(resetPasswordSchema)], // Validate request body before reaching controller
      schema: resetPasswordSwagger, // Swagger documentation for this route
    },
    controller.resetPassword.bind(controller), // Bind controller context
  );
};
