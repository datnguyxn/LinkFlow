import { EmailWorker } from '../workers/mail.worker.ts';
import { SmtpProvider } from '../infrastructure/mail/providers/smtp.provider.ts';
import { AuditLogRepository } from '../modules/audit-log/index.ts';
import { AuditWorker } from '../workers/audit.worker.ts';

export async function registerWorkers() {
  // Initialize repositories and providers
  const auditRepository = new AuditLogRepository();
  const smtpProvider = new SmtpProvider();

  // Initialize workers
  const auditWorker = new AuditWorker(auditRepository);
  const emailWorker = new EmailWorker(smtpProvider);

  // Start workers
  await Promise.all([emailWorker.start(), auditWorker.start()]);

  console.log('✅ Workers started');
}
