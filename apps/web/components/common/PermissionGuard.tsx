'use client';

import { useWorkspaceContext } from '@/contexts/workspace.context';

type PermissionGuardProps = {
  permission: string;

  children: React.ReactNode;

  fallback?: React.ReactNode;
};

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { currentWorkspace } = useWorkspaceContext();

  if (!currentWorkspace) {
    return fallback;
  }

  const hasPermission = currentWorkspace.permissions.includes(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}
