import { SmtpProvider } from '../infrastructure/mail/providers/smtp.provider.ts';
import { redisPublisher } from '../infrastructure/cache/publisher.ts';
import { redis } from '../infrastructure/cache/index.ts';
import { AuditLogRepository } from '../modules/audit-log/index.ts';
import { NotificationRepository } from '../modules/notification/index.ts';

import {
  AdminUserAuditWorker,
  AuthAuditWorker,
  UserAuditWorker,
  WorkspaceAuditWorker,
  WorkspaceMemberAuditWorker,
  WorkspaceInvitationAuditWorker,
  AdminUserMailWorker,
  AuthMailWorker,
  WorkspaceInvitationMailWorker,
  WorkspaceMemberNotificationWorker,
  WorkspaceNotificationWorker,
  NotificationWorker,
  WorkspaceMemberEmailWorker,
  WorkspaceEmailWorker,
  UrlAuditWorker,
  UrlCacheWorker
} from '../workers/index.ts';

export async function registerWorkers() {
  const auditRepository = new AuditLogRepository();
  const smtpProvider = new SmtpProvider();
  const notificationRepository = new NotificationRepository();

  // Redis publisher
  await redisPublisher.connect();

  const adminUserAuditWorker = new AdminUserAuditWorker(auditRepository);

  const authAuditWorker = new AuthAuditWorker(auditRepository);

  const userAuditWorker = new UserAuditWorker(auditRepository);

  const workspaceAuditWorker = new WorkspaceAuditWorker(auditRepository);

  const workspaceMemberAuditWorker = new WorkspaceMemberAuditWorker(auditRepository);

  const workspaceInvitationAuditWorker = new WorkspaceInvitationAuditWorker(auditRepository);

  const adminUserMailWorker = new AdminUserMailWorker(smtpProvider);

  const authMailWorker = new AuthMailWorker(smtpProvider);

  const workspaceMemberMailWorker = new WorkspaceMemberEmailWorker(smtpProvider);

  const workspaceMemberNotificationWorker = new WorkspaceMemberNotificationWorker(
    notificationRepository,
    redisPublisher,
  );

  const workspaceInvitationMailWorker = new WorkspaceInvitationMailWorker(smtpProvider);

  const notificationWorker = new NotificationWorker(notificationRepository, redisPublisher);

  const workspaceEmailWorker = new WorkspaceEmailWorker(smtpProvider);

  const workspaceNotificationWorker = new WorkspaceNotificationWorker(
    notificationRepository,
    redisPublisher,
  );

  const urlAuditWorker = new UrlAuditWorker(auditRepository);

  const urlCacheWorker = new UrlCacheWorker(redis);

  await Promise.all([
    adminUserMailWorker.start(),
    authMailWorker.start(),
    workspaceInvitationMailWorker.start(),
    workspaceMemberMailWorker.start(),

    workspaceMemberAuditWorker.start(),
    workspaceInvitationAuditWorker.start(),
    adminUserAuditWorker.start(),
    authAuditWorker.start(),
    userAuditWorker.start(),
    workspaceAuditWorker.start(),

    workspaceMemberNotificationWorker.start(),
    notificationWorker.start(),

    workspaceEmailWorker.start(),
    workspaceNotificationWorker.start(),

    urlAuditWorker.start(),
    urlCacheWorker.start(),
  ]);

  console.log('✅ Workers started');
}
