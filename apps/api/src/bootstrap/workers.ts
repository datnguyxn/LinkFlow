import { SmtpProvider } from '../infrastructure/mail/providers/smtp.provider.ts';
import { redisPublisher } from '../infrastructure/cache/publisher.ts';

import { AuditLogRepository } from '../modules/audit-log/index.ts';
import { NotificationRepository } from '../modules/notification/index.ts';

import {
  AdminUserAuditWorker,
  AuthAuditWorker,
  UserAuditWorker,
  WorkspaceAuditWorker,
  EmailWorker, 
  NotificationWorker
} from '../workers/index.ts';

export async function registerWorkers() {
  const auditRepository = new AuditLogRepository();
  const smtpProvider = new SmtpProvider();
  const notificationRepository = new NotificationRepository();

  // Redis publisher
  await redisPublisher.connect();

  const adminUserAuditWorker =
    new AdminUserAuditWorker(auditRepository);

  const authAuditWorker =
    new AuthAuditWorker(auditRepository);

  const userAuditWorker =
    new UserAuditWorker(auditRepository);

  const workspaceAuditWorker =
    new WorkspaceAuditWorker(auditRepository);

  const emailWorker =
    new EmailWorker(smtpProvider);

  const notificationWorker =
    new NotificationWorker(
      notificationRepository,
      redisPublisher,
    );

  await Promise.all([
    emailWorker.start(),

    adminUserAuditWorker.start(),
    authAuditWorker.start(),
    userAuditWorker.start(),
    workspaceAuditWorker.start(),

    notificationWorker.start(),
  ]);

  console.log('✅ Workers started');
}