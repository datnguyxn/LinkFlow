'use client';

import { useState } from 'react';
import { CheckCircle2, Clock3, Mail, OctagonX, Search, UserPlus, XCircle } from 'lucide-react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import { WorkspaceDetail } from '@/types/workspace.type';

import { useWorkspaceInvitations } from '@/hooks/queries/workspace/invitations/useWorkspaceInvitations';

import WorkspaceInvitationSummary from './WorkspaceInvitationSummary';
import WorkspaceInvitationTable from './WorkspaceInvitationTable';
import WorkspaceInvitationTableSkeleton from './WorkspaceInvitationTableSkeleton';
import WorkspaceInvitationDetail from './WorkspaceInvitationDetail';
import InviteMemberDialog from './InviteMemberDialog';

interface Props {
  workspace: WorkspaceDetail;
}

const PAGE_SIZE = 10;

export default function WorkspaceInvitationsPage({ workspace }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  const { data, isLoading, isError } = useWorkspaceInvitations(
    workspace.id,
    page,
    PAGE_SIZE,
    search,
  );

  const invitations = data?.invitations ?? [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invitations</h1>

            <p className="mt-1 text-sm text-slate-500">Manage workspace invitations.</p>
          </div>

          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite member
          </Button>
        </div>

        {/* Summary */}
        <div
          className="
            flex
            divide-x
            divide-slate-200
            rounded-xl
            border
            bg-white
            dark:divide-slate-800
            dark:bg-slate-900
          "
        >
          <WorkspaceInvitationSummary
            icon={Mail}
            label="Total"
            value={summary?.total ?? 0}
            iconClassName="text-blue-600"
          />

          <WorkspaceInvitationSummary
            icon={Clock3}
            label="Pending"
            value={summary?.pending ?? 0}
            iconClassName="text-amber-500"
          />

          <WorkspaceInvitationSummary
            icon={CheckCircle2}
            label="Accepted"
            value={summary?.accepted ?? 0}
            iconClassName="text-emerald-500"
          />

          <WorkspaceInvitationSummary
            icon={XCircle}
            label="DECLINED"
            value={summary?.rejected ?? 0}
            iconClassName="text-yellow-500"
          />

          <WorkspaceInvitationSummary
            icon={OctagonX}
            label="Expired"
            value={summary?.expired ?? 0}
            iconClassName="text-red-500"
          />
        </div>

        {/* Table */}
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            bg-white
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              px-5
              py-4
            "
          >
            <div>
              <h2 className="font-semibold">Invitations</h2>

              <p className="text-xs text-slate-500">{pagination?.totalItems ?? 0} invitations</p>
            </div>

            <div className="relative w-64">
              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                "
              />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pl-9"
                placeholder="Search invitations"
              />
            </div>
          </div>

          {isLoading ? (
            <WorkspaceInvitationTableSkeleton />
          ) : (
            <WorkspaceInvitationTable
              invitations={invitations}
              page={pagination?.page ?? 1}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={setPage}
              onSelectInvitation={(invitation) => setSelectedInvitationId(invitation.id)}
            />
          )}

          {isError && (
            <div className="p-8 text-center text-red-500">Failed to load invitations.</div>
          )}
        </div>
      </div>

      <WorkspaceInvitationDetail
        workspaceId={workspace.id}
        invitationId={selectedInvitationId}
        onClose={() => setSelectedInvitationId(null)}
      />

      <InviteMemberDialog
        workspaceId={workspace.id}
        open={inviteOpen}
        currentRole={workspace.role?.id}
        onOpenChange={setInviteOpen}
      />
    </>
  );
}
