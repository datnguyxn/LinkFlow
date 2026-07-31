// WorkspaceMembersPage.tsx

'use client';

import { useState } from 'react';

import { User, Search, UserPlus, Users, UserCheck, Crown, UserX, UserX2 } from 'lucide-react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import { WorkspaceDetail } from '@/types/workspace.type';

import { useWorkspaceMembers } from '@/hooks/queries/workspace/members/useWorkspaceMembers';

import WorkspaceMemberTable from './WorkspaceMemberTable';
import WorkspaceMemberDetail from './WorkspaceMemberDetail';
import WorkspaceMemberTableSkeleton from './WorkspaceMemberTableSkeleton';
import InviteMemberDialog from '../invitations/InviteMemberDialog';

interface WorkspaceMembersPageProps {
  workspace: WorkspaceDetail;
}

const PAGE_SIZE = 10;

export default function WorkspaceMembersPage({ workspace }: WorkspaceMembersPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, isLoading, isError } = useWorkspaceMembers(workspace.id, page, PAGE_SIZE, search);

  const members = data?.members ?? [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Members</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage people who have access to this workspace.
            </p>
          </div>

          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite member
          </Button>
        </div>

        {/* Summary */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-6 sm:divide-x sm:divide-y-0">
            <MemberOverviewItem
              icon={Users}
              label="Total members"
              value={summary?.total ?? 0}
              iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            />

            <MemberOverviewItem
              icon={UserCheck}
              label="Active members"
              value={summary?.active ?? 0}
              iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />

            <MemberOverviewItem
              icon={UserX}
              label="Left members"
              value={summary?.left ?? 0}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />

            <MemberOverviewItem
              icon={UserX2}
              label="Removed members"
              value={summary?.removed ?? 0}
              iconClassName="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />

            <MemberOverviewItem
              icon={Crown}
              label="Admins"
              value={members.filter((member) => member.role.name === 'ADMIN').length}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />

            <MemberOverviewItem
              icon={User}
              label="Members"
              value={members.filter((member) => member.role.name === 'MEMBER').length}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
          </div>
        </div>

        {/* Error */}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Failed to load workspace members.
          </div>
        )}

        {/* Table */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Workspace members</h2>

              <p className="mt-1 text-xs text-slate-500">{summary?.total ?? 0} members</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search members..."
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <WorkspaceMemberTableSkeleton />
          ) : (
            <WorkspaceMemberTable
              members={members}
              page={pagination?.page ?? 1}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={setPage}
              onSelectMember={(member) => setSelectedMemberId(member.userId)}
            />
          )}
        </div>
      </div>

      <WorkspaceMemberDetail
        workspaceId={workspace.id}
        workspace={workspace}
        memberId={selectedMemberId}

        onClose={() => setSelectedMemberId(null)}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        currentRole={workspace.role.name}
        workspaceId={workspace.id}
      />
    </>
  );
}
interface MemberOverviewItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  iconClassName: string;
}

function MemberOverviewItem({ icon: Icon, label, value, iconClassName }: MemberOverviewItemProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClassName}
        `}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
