import { UserAction } from '../../../common/enums/user-action.enum.ts';
import type { Prisma } from '@prisma/client';

export interface UserActionEvent {
  event: UserAction.USER_ACTION;

  action: UserAction;

  email: string;

  fullName: string;

  adminId: string;

  targetUserId: string;

  reason?: string;

  metadata?: Record<string, Prisma.JsonValue>;

  changes: Record<string, { oldValue: Prisma.JsonValue; newValue: Prisma.JsonValue }>;

  ipAddress?: string | null;

  timestamp: Date;
}
