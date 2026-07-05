import { AuthController } from "../controller/auth.controller.ts";
import type { FastifyInstance } from "fastify";
import { validate } from "../../../utils/validator.util.ts";
import { registerSchema, type RegisterBody } from "../validator/register.validator.ts";
import { registerSwagger } from "../../../swaggers/auth/auth.swagger.ts";

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
};