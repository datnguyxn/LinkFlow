import { Prisma } from '@prisma/client';
import { prisma } from '../../../infrastructure/database/index.ts';

/**
 * NotificationRepository class provides methods to interact with the notification data in the database.
 * It includes methods for creating notifications.
 */
export class NotificationRepository {
    
    /**
     * Create a new notification
     * @param data - The data for the new notification
     * @returns The created notification record
     */
    async create(data: Prisma.NotificationCreateInput) {
        
        // Use Prisma to create a new notification record in the database
        return prisma.notification.create({
            data,
        });
    }
}