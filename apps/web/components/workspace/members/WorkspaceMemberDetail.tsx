// WorkspaceMemberDetail.tsx

'use client';

import { CalendarDays, Mail, Shield, Upload, User, X } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

import { useWorkspaceMember } from '@/hooks/queries/workspace/members/useWorkspaceMemberDetail';
import WorkspaceMemberAvatar from './WorkspaceMemberAvatar';
import WorkspaceMemberDetailRow from './WorkspaceMemberDetailRow';
import Button from '@/components/ui/button';
import PermissionGuard from '@/components/common/PermissionGuard';
import { WORKSPACE_PERMISSION } from '@/constants/permissions';
import { useLeaveWorkspaceMember } from '@/hooks/mutations/workspace/members/useLeaveWorkspaceMember';
import { useRemoveWorkspaceMember } from '@/hooks/mutations/workspace/members/useRemoveWorkspaceMember';
import { useTransferOwnership } from '@/hooks/mutations/workspace/members/useTransferOwnership';
import { appToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth.context';
import { WorkspaceDetail } from '@/types/workspace.type';
import UpdateMemberRoleDialog from './UpdateMemberRoleDialog';
import { useState } from 'react';

interface WorkspaceMemberDetailProps {
  workspaceId: string;
  memberId: string | null;
  workspace: WorkspaceDetail;
  onClose: () => void;
}

export default function WorkspaceMemberDetail({
  workspaceId,
  memberId,
  workspace,
  onClose,
}: WorkspaceMemberDetailProps) {
  const { data: member, isLoading } = useWorkspaceMember(workspaceId, memberId ?? undefined);

  const { user } = useAuthContext();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const leaveWorkspace = useLeaveWorkspaceMember(workspaceId);

  const removeMember = useRemoveWorkspaceMember(workspaceId, memberId ?? '');

  const transferOwnership = useTransferOwnership(workspaceId);

  const isCurrentUser = user?.email === member?.user.email;

  const isTargetOwner = member?.role.name === 'OWNER';

  const currentUserRole = workspace.role.name;

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';

  const canTransferOwnership = isOwner && !isCurrentUser && !isTargetOwner;

  const canUpdateRole = isOwner && !isCurrentUser && !isTargetOwner;

  const canRemoveMember =
    !isCurrentUser && ((isOwner && !isTargetOwner) || (isAdmin && !isTargetOwner));

  const canLeaveWorkspace = isCurrentUser && !isOwner;

  const router = useRouter();

  const handleLeaveWorkspace = async () => {
    try {
      await leaveWorkspace.mutateAsync();

      appToast.success('You have left the workspace.');

      onClose();

      router.replace('/dashboard');
    } catch (error) {
      console.error(error);

      appToast.error('Failed to leave workspace.');
    }
  };

  const handleRemoveMember = async () => {
    try {
      await removeMember.mutateAsync();

      appToast.success('Member removed successfully.');

      onClose();
    } catch (error) {
      console.error(error);

      appToast.error('Failed to remove member.');
    }
  };

  const handleTransferOwnership = async () => {
    if (!member) {
      return;
    }

    try {
      await transferOwnership.mutateAsync(member.user.id);

      appToast.success('Ownership transferred successfully.');

      onClose();
    } catch (error) {
      console.error(error);

      appToast.error('Failed to transfer ownership.');
    }
  };

  const leaving = leaveWorkspace.isPending;
  const removing = removeMember.isPending;
  const transferring = transferOwnership.isPending;

  return (
    <>
      <Sheet
        open={Boolean(memberId)}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Member details</SheetTitle>

            <SheetDescription>View workspace member information.</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="space-y-4 p-6">
              <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

              <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

              <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : member ? (
            <>
              <div className="space-y-6 p-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <WorkspaceMemberAvatar
                    name={member.user.fullName}
                    avatarUrl={member.user.avatarUrl}
                  />

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{member.user.fullName}</h3>

                    <p className="truncate text-sm text-slate-500">{member.user.email}</p>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-3">
                  <WorkspaceMemberDetailRow icon={Mail} label="Email" value={member.user.email} />

                  <WorkspaceMemberDetailRow icon={Shield} label="Role" value={member.role.name} />

                  <WorkspaceMemberDetailRow icon={User} label="Status" value={member.status} />

                  <WorkspaceMemberDetailRow
                    icon={CalendarDays}
                    label="Joined"
                    value={new Date(member.joinedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  />
                </div>
              </div>

              <SheetFooter>
                {/* Update role */}
                <PermissionGuard permission={WORKSPACE_PERMISSION.MEMBER_UPDATE}>
                  {canUpdateRole && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setRoleDialogOpen(true)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Update role
                    </Button>
                  )}
                </PermissionGuard>

                {/* Transfer ownership */}
                {canTransferOwnership && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleTransferOwnership}
                    disabled={transferring}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {transferring ? 'Transferring...' : 'Transfer ownership'}
                  </Button>
                )}

                {/* Leave workspace */}
                {canLeaveWorkspace && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLeaveWorkspace}
                    disabled={leaving}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {leaving ? 'Leaving...' : 'Leave workspace'}
                  </Button>
                )}

                {/* Remove member */}
                <PermissionGuard permission={WORKSPACE_PERMISSION.MEMBER_REMOVE}>
                  {canRemoveMember && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleRemoveMember}
                      disabled={removing}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {removing ? 'Removing...' : 'Remove member'}
                    </Button>
                  )}
                </PermissionGuard>
              </SheetFooter>
            </>
          ) : (
            <div className="p-6 text-sm text-slate-500">Member not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <UpdateMemberRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        workspaceId={workspaceId}
        member={member}
      />
    </>
  );
}
