// import type { FastifyRequest } from "fastify";
// import { ForbiddenError } from "../errors/forbidden.error.ts";
// import { ERROR_CODE } from "../constants/index.ts";
// import { Permissions } from "@prisma/client";

// export function permissionGuard(...permissions: Permissions[]) {
//     return async (request: FastifyRequest) => {

//         if (!request.user) {
//             throw new ForbiddenError(
//                 request.t("auth.auth.forbidden"),
//                 ERROR_CODE.FORBIDDEN,
//             );
//         }

//         // super admin
//         if (
//             request.user.permissions?.includes(Permissions.ADMIN)
//         ) {
//             return;
//         }

//         const hasPermission =
//             permissions.every(permission =>
//                 request.user.permissions?.includes(permission),
//             );

//         if (!hasPermission) {
//             throw new ForbiddenError(
//                 request.t("auth.auth.forbidden"),
//                 ERROR_CODE.FORBIDDEN,
//             );
//         }
//     };
// }
