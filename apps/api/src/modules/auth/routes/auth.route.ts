import { AuthController } from "../controller/auth.controller.ts";
import type { FastifyInstance } from "fastify";
import { validate } from "../../../utils/validator.util.ts";
import { registerSchema, type RegisterBody } from "../validator/register.validator.ts";
import { registerSwagger, loginSwagger } from "../../../swaggers/index.ts";
import { loginSchema, type LoginBody } from "../validator/login.validator.ts";

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
        "/register",
        {
            // Limit registration attempts
            config: {
                rateLimit: {
                    max: 5,              // Maximum 5 requests
                    timeWindow: "1 minute", // Per minute
                },
            },

            // Validate request body before reaching controller
            preValidation: [validate(registerSchema)],

            schema: registerSwagger // Swagger documentation for this route,
        },

        // Bind controller context
        controller.registerUser.bind(controller)
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
        "/login",
        {
            config: {
                rateLimit: {
                    max: 10,              // Maximum 10 requests
                    timeWindow: "1 minute", // Per minute
                },
            },
            preValidation: [validate(loginSchema)], // Validate request body before reaching controller
            schema: loginSwagger // Swagger documentation for this route
        },
        controller.loginUser.bind(controller) // Bind controller context
    );
};