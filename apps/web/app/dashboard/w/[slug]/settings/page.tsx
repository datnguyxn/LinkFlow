'use client';

import { useWorkspaceContext } from '@/contexts/workspace.context';

import WorkspaceSettingsPageSkeleton from '@/components/workspace/settings/WorkspaceSettingsPageSkeleton';

import WorkspaceSettingsHeader from '@/components/workspace/settings/WorkspaceSettingsHeader';
import WorkspaceGeneralSettings from '@/components/workspace/settings/WorkspaceGeneralSettings';
import WorkspaceBrandingSettings from '@/components/workspace/settings/WorkspaceBrandingSettings';
import WorkspaceMemberSettings from '@/components/workspace/settings/WorkspaceMemberSettings';
import WorkspaceSecuritySettings from '@/components/workspace/settings/WorkspaceSecuritySettings';
import WorkspaceDangerZone from '@/components/workspace/settings/WorkspaceDangerZone';
import WorkspaceInvitationSettings from '@/components/workspace/settings/WorkspaceInvitationSettings';

import PermissionGuard from '@/components/common/PermissionGuard';

import { WORKSPACE_PERMISSION } from '@/constants/permissions';

export default function WorkspaceSettingsPage() {
  const {
    currentWorkspace,
    loading,
  } = useWorkspaceContext();

  if (loading || !currentWorkspace) {
    return <WorkspaceSettingsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <WorkspaceSettingsHeader
        workspace={currentWorkspace}
      />

      <main className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        {/* General */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.WORKSPACE_UPDATE}>
          <WorkspaceGeneralSettings
            workspace={currentWorkspace}
          />
        </PermissionGuard>

        {/* Branding */}
        <WorkspaceBrandingSettings
          workspace={currentWorkspace}
        />

        {/* Members */}
        <PermissionGuard
          permission={
            WORKSPACE_PERMISSION.MEMBER_READ
          }
        >
          <WorkspaceMemberSettings
            workspace={currentWorkspace}
          />
        </PermissionGuard>

        {/* Invitations */}
        <PermissionGuard
          permission={
            WORKSPACE_PERMISSION.INVITATION_READ
          }
        >
          <WorkspaceInvitationSettings
            workspace={currentWorkspace}
          />
        </PermissionGuard>

        {/* Security */}
        <WorkspaceSecuritySettings
          workspace={currentWorkspace}
        />

        {/* Owner only */}
        <PermissionGuard
          permission={
            WORKSPACE_PERMISSION.WORKSPACE_DELETE
          }
        >
          <WorkspaceDangerZone
            workspace={currentWorkspace}
          />
        </PermissionGuard>
      </main>
    </div>
  );
}