import { AuthService } from '../service/auth.service.ts';
import { ResponseHandler } from "../../../common/responses/handler.response.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { HTTP_STATUS, cookieOptions } from "../../../common/constants/index.ts";
import type { AuthResponse } from "../types/auth.type.ts";
import type { RegisterBody } from "../validator/register.validator.ts";

/**
 * AuthController handles incoming HTTP requests related to authentication.
 * - It delegates business logic to the AuthService and formats responses.
 */

export class AuthController {
    private authService: AuthService;

    constructor() {
        // Initialize service layer
        this.authService = new AuthService();
    }

    /**
     * Handle user registration request
     * Flow:
     * 1. Extract body from request
     * 2. Call service to register user
     * 3. Return error if user already exists
     * 4. Return success response with tokens
     */
    async registerUser(
        request: FastifyRequest<{ Body: RegisterBody }>,
        reply: FastifyReply
    ) {
        // Extract validated input from request body
        const { email, password, fullName } = request.body;

        // Call service layer to handle business logic
        const data = await this.authService.registerUser(email, password, fullName);

        // Handle case: user already exists or registration failed
        if (data === null) {
            return ResponseHandler.error(
                reply,
                HTTP_STATUS.BAD_REQUEST,
                request.t("common.invalidCredentials")
            );
        }

        // Set refresh token in HTTP-only cookie for security
        reply.setCookie(
            "refreshToken",
            data.refreshToken,
            cookieOptions,
        );

        // Successful registration
        return ResponseHandler.success<AuthResponse>(
            reply,
            data,
            request.t("auth.registerSuccess"),
            HTTP_STATUS.CREATED
        );
    }
}