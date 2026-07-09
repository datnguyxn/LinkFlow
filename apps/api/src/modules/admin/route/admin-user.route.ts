import type { FastifyInstance } from "fastify";
import { roleGuard } from "../../../common/guards/index.ts";
import { UserRole } from "@prisma/client";
import { authMiddleware } from "../../../common/middleware/index.ts";
import { AdminUserController } from "../controller/admin-user.controller.ts";
import {
    getAllUsersSchema,
    getUserSchema,
    banUserSchema,
    unbanUserSchema,
    changeRoleSchema,
    deleteUserSchema,
    restoreUserSchema
} from "../../../swaggers/index.ts";


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
    app.get("/", { schema: getAllUsersSchema }, controller.getAllUsers.bind(controller));

    // Bind controller context for fetching a specific user by ID
    app.get("/:id", { schema: getUserSchema }, controller.getUserById.bind(controller));

    // Bind controller context for banning a specific user by ID
    app.patch("/:id/ban", { schema: banUserSchema }, controller.banUser.bind(controller));

    // Bind controller context for unbanning a specific user by ID
    app.patch("/:id/unban", { schema: unbanUserSchema }, controller.unbanUser.bind(controller));

    // Bind controller context for changing a specific user's role by ID
    app.patch("/:id/role", { schema: changeRoleSchema }, controller.changeRole.bind(controller));

    // Bind controller context for deleting a specific user by ID
    app.delete("/:id", { schema: deleteUserSchema }, controller.deleteUser.bind(controller));

    // Bind controller context for restoring a specific user by ID
    app.patch("/:id/restore", { schema: restoreUserSchema }, controller.restoreUser.bind(controller));

};