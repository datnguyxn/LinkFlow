import type { FastifyInstance } from "fastify";
import { roleGuard } from "../../../common/guards/index.ts";
import { UserRole } from "@prisma/client";
import { authMiddleware } from "../../../common/middleware/index.ts";
import { AdminUserController } from "../controller/admin-user.controller.ts";

const controller = new AdminUserController();

/**
 * Admin user management routes
 */
export const adminUserRoutes = async (app: FastifyInstance) => {
    // Add authentication and authorization hooks for admin user management routes
    app.addHook("preHandler", app.authenticate);

    // Ensure user is authenticated before accessing admin routes
    app.addHook(
        "preHandler",
        authMiddleware, // Ensure user is authenticated before accessing admin routes
    );

    // Ensure user has ADMIN role before accessing admin routes
    app.addHook(
        "preHandler",
        roleGuard(UserRole.ADMIN),
    );

    // Bind controller context for fetching all users
    app.get("/", controller.getAllUsers.bind(controller));

    // Bind controller context for fetching a specific user by ID
    app.get("/:id", controller.getUserById.bind(controller));

    // Bind controller context for banning a specific user by ID
    app.patch("/:id/ban", controller.banUser.bind(controller));

    // Bind controller context for unbanning a specific user by ID
    app.patch("/:id/unban", controller.unbanUser.bind(controller));

    // Bind controller context for changing a specific user's role by ID
    app.patch("/:id/role", controller.changeRole.bind(controller));

    // Bind controller context for deleting a specific user by ID
    app.delete("/:id", controller.deleteUser.bind(controller));

    // Bind controller context for restoring a specific user by ID
    app.patch("/:id/restore", controller.restoreUser.bind(controller));

};