'use client';

import { BarChart3, Link2, QrCode, Settings, ShieldCheck, UserPlus, Users } from 'lucide-react';

import { WORKSPACE_PERMISSION } from '@/constants/permissions';
import PermissionGuard from '@/components/common/PermissionGuard';

import ManagementCard from './ManagementCard';
import { WorkspaceDetail } from '@/types/workspace.type';

export default function WorkspaceManagement({ workspace }: { workspace: WorkspaceDetail }) {
  return (
    <section>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Workspace management
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage members, access, and workspace resources.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Links */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.URL_READ}>
          <ManagementCard
            icon={Link2}
            title="Links"
            description="Create and manage short links."
            href={`/dashboard/w/${workspace?.slug}/links`}
          />
        </PermissionGuard>

        {/* QR Codes */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.QRCODE_READ}>
          <ManagementCard
            icon={QrCode}
            title="QR codes"
            description="Create and manage QR codes."
            href="/qrcodes"
          />
        </PermissionGuard>

        {/* Analytics */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.ANALYTICS_READ}>
          <ManagementCard
            icon={BarChart3}
            title="Analytics"
            description="View workspace analytics."
            href="/analytics"
          />
        </PermissionGuard>

        {/* Members */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.MEMBER_READ}>
          <ManagementCard
            icon={Users}
            title="Members"
            description="Manage workspace members and their roles."
            href={`/dashboard/w/${workspace?.slug}/settings/members`}
          />
        </PermissionGuard>

        {/* Invitations */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.INVITATION_CREATE}>
          <ManagementCard
            icon={UserPlus}
            title="Invitations"
            description="Invite new members to your workspace."
            href={`/dashboard/w/${workspace?.slug}/settings/invitations`}
          />
        </PermissionGuard>

        {/* API Keys */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.API_KEY_READ}>
          <ManagementCard
            icon={ShieldCheck}
            title="API keys"
            description="Manage API access for your workspace."
            href="/api-keys"
          />
        </PermissionGuard>

        {/* Workspace Settings */}
        <PermissionGuard permission={WORKSPACE_PERMISSION.WORKSPACE_UPDATE}>
          <ManagementCard
            icon={Settings}
            title="Workspace settings"
            description="Update workspace configuration."
            href={`/dashboard/w/${workspace?.slug}/settings`}
          />
        </PermissionGuard>
      </div>
    </section>
  );
}
