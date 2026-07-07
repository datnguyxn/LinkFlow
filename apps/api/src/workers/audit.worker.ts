import { AuditLogRepository } from "../modules/audit-log/repository/audit-log.repository.ts";
import { consumer } from "../infrastructure/queue/index.ts";
import {
    RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY,
} from "../common/constants/index.ts";
import {
    AUDIT_ACTION,
    AUDIT_RESOURCE,
} from "../common/constants/audit.constant.ts";
import type { UserRegisteredEvent } from "../events/auth/user-registered.event.ts";
import type { UserLoginEvent } from "../events/auth/user-login.event.ts";

export class AuditWorker {
    constructor(
        private readonly auditRepository: AuditLogRepository,
    ) { }

    async start() {
        await consumer.consume<UserRegisteredEvent>(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_REGISTERED,
            RABBITMQ_QUEUE.AUDIT_USER_REGISTERED,

            async (event) => {
                await this.auditRepository.create({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_REGISTERED,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        email: event.email,
                        fullName: event.fullName,
                    },

                    ipAddress: event.ipAddress,
                });

                console.log(
                    `Audit log created for user registration: ${event.email}`,
                );
            },
        );

        await consumer.consume<UserLoginEvent>(
            RABBITMQ_EXCHANGE.AUTH,
            RABBITMQ_ROUTING_KEY.USER_LOGIN,
            RABBITMQ_QUEUE.AUDIT_USER_LOGIN,

            async (event) => {
                await this.auditRepository.create({
                    user: {
                        connect: {
                            id: event.userId,
                        },
                    },

                    action: AUDIT_ACTION.USER_LOGIN,

                    resource: AUDIT_RESOURCE.USER,

                    resourceId: event.userId,

                    metadata: {
                        email: event.email,
                        fullName: event.fullName,
                    },

                    ipAddress: event.ipAddress,
                });

                console.log(
                    `Audit log created for user login: ${event.email}`,
                );
            },
        );
    }
}