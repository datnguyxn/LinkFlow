'use client';

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  UserRound,
} from 'lucide-react';

import Button from '@/components/ui/button';

import { WorkspaceMember } from '@/types/workspace.type';

import WorkspaceMemberAvatar from './WorkspaceMemberAvatar';
import WorkspaceStatusBadge from './WorkspaceStatusBadge';

interface WorkspaceMemberTableProps {
  members: WorkspaceMember[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectMember: (member: WorkspaceMember) => void;
}

export default function WorkspaceMemberTable({
  members,
  page,
  totalPages,
  onPageChange,
  onSelectMember,
}: WorkspaceMemberTableProps) {
  if (!members.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <UserRound className="h-5 w-5 text-slate-400" />
        </div>

        <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
          No members found
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Try changing your search.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-slate-50/70 dark:bg-slate-800/30">
            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Member
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Joined
              </th>

              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>

          <tbody>
            {members.map((member) => {
              const disabled = member.status !== 'ACTIVE';

              return (
                <tr
                  key={member.id}
                  onClick={() => {
                    if (!disabled) {
                      onSelectMember(member);
                    }
                  }}
                  className={`
                    border-b border-slate-100 dark:border-slate-800
                    ${
                      disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }
                  `}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <WorkspaceMemberAvatar
                        name={member.user.fullName}
                        avatarUrl={member.user.avatarUrl}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {member.user.fullName}
                        </p>

                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />

                      <span className="text-sm font-medium">
                        {member.role.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <WorkspaceStatusBadge status={member.status} />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(member.joinedAt).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      disabled={disabled}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (!disabled) {
                          onSelectMember(member);
                        }
                      }}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none dark:hover:bg-slate-800"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm text-slate-500">
          Page{' '}
          <span className="font-medium text-slate-900 dark:text-white">
            {page}
          </span>{' '}
          of{' '}
          <span className="font-medium text-slate-900 dark:text-white">
            {totalPages}
          </span>
        </p>

        <div className="flex items-center gap-2">
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