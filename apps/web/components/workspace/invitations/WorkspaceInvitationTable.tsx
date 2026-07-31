'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/components/ui/button';

import WorkspaceInvitationRow from './WorkspaceInvitationRow';

import { WorkspaceInvitation } from '@/types/workspace.type';

interface Props {
  invitations: WorkspaceInvitation[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectInvitation: (invitation: WorkspaceInvitation) => void;
}

export default function WorkspaceInvitationTable({
  invitations,
  page,
  totalPages,
  onPageChange,
  onSelectInvitation,
}: Props) {
  if (!invitations.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm text-slate-500">No invitations found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="max-h-[600px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
            <tr
              className="
            border-b
            border-slate-200
            text-left
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-slate-500
            dark:border-slate-800
          "
            >
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Expires</th>
            </tr>
          </thead>

          <tbody>
            {invitations.map((invitation) => (
              <WorkspaceInvitationRow
                key={invitation.id}
                invitation={invitation}
                onClick={() => onSelectInvitation(invitation)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="
      flex
      items-center
      justify-between
      border-t
      border-slate-200
      px-5
      py-4
      dark:border-slate-800
    "
      >
        <p className="text-sm text-slate-500">
          Page <span className="font-medium text-slate-900 dark:text-white">{page}</span> of{' '}
          <span className="font-medium text-slate-900 dark:text-white">{totalPages}</span>
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
