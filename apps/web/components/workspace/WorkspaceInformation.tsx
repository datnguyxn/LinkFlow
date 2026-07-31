'use client';

import { useEffect, useState } from 'react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import { appToast } from '@/lib/toast';

import { WorkspaceDetail } from '@/types/workspace.type';
// import { useUpdateWorkspace } from '@/hooks/mutations/useUpdateWorkspace';
import PermissionGuard from '@/components/common/PermissionGuard';
import { WORKSPACE_PERMISSION } from '@/constants/permissions';

export default function WorkspaceInformation({
  workspace,
}: {
  workspace: WorkspaceDetail;
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Workspace information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage workspace details.
          </p>
        </div>

      </div>

      {/* Information */}
      <div className="mt-6 space-y-5">
        {/* Name */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">
            Name
          </p>
            <p className="text-sm font-medium">
              {workspace.name}
            </p>
        </div>

        {/* Slug */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">
            Slug
          </p>
          <p className="text-sm font-medium">{workspace.slug}</p>
        </div>
      

        {/* Role */}
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">
            Your role
          </p>

          <p className="mt-1 text-sm font-medium">
            {workspace.role.name}
          </p>
        </div>

        {/* Created */}
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">
            Created
          </p>

          <p className="mt-1 text-sm font-medium">
            {new Date(workspace.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}