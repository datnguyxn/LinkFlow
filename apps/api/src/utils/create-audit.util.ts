import { Prisma } from '@prisma/client';
import type { AuditLogRepository } from '../modules/audit-log/index.ts';

export async function createAuditLog(
  data: Prisma.AuditLogCreateInput,
  auditRepository: AuditLogRepository,
): Promise<void> {
  await auditRepository.create(data);
}
