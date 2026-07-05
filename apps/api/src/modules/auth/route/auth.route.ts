import { AuthController } from "../controller/auth.controller.ts";
import type { FastifyInstance } from "fastify";

const controller = new AuthController();

export const authRoutes = async (app: FastifyInstance) => {
    app.get(
        "/:email",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "1 minute",
                },
            },
        },
        controller.findCurrentUserByEmail.bind(controller)
    );
}