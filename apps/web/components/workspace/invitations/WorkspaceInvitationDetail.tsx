'use client';

import { CalendarDays, Clock3, Mail, Shield, User, Link2 } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import Button from '@/components/ui/button';
import { useState } from 'react';
import { useWorkspaceInvitation } from '@/hooks/queries/workspace/invitations/useWorkspaceInvitation';
import { useRevokeWorkspaceInvitation } from '@/hooks/mutations/workspace/invitations/useRevokeWorkspaceInvitation';
import WorkspaceMemberDetailRow from '../members/WorkspaceMemberDetailRow';
import { useInviteWorkspaceMember } from '@/hooks/mutations/workspace/invitations/useInviteWorkspaceMember';
import { appToast } from '@/lib/toast';
import { config } from '@/config';

interface WorkspaceInvitationDetailProps {
  workspaceId: string;
  invitationId: string | null;
  onClose: () => void;
}

export default function WorkspaceInvitationDetail({
  workspaceId,
  invitationId,
  onClose,
}: WorkspaceInvitationDetailProps) {
  const { data: invitation, isLoading } = useWorkspaceInvitation(workspaceId, invitationId);


  const [loading, setLoading] = useState(false);
  const { mutate: revokeInvitation } = useRevokeWorkspaceInvitation(workspaceId);

  const resendInvitation = useInviteWorkspaceMember(workspaceId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        appToast.success('Invitation link copied to clipboard.');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        appToast.error('Failed to copy invitation link.');
      }
    );
  };

  const handleResendInvitation = async () => {
    if (!invitation) return;

    try {
      setLoading(true);
      await resendInvitation.mutateAsync({
        email: invitation.email,
        roleId: invitation.role.id,
      });

      appToast.success('Invitation resent successfully.');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={Boolean(invitationId)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invitation details</SheetTitle>

          <SheetDescription>View invitation information.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

            <div className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : invitation ? (
          <>
            <div className="space-y-3 p-6">
              <WorkspaceMemberDetailRow icon={Mail} label="Email" value={invitation.email} />

              <WorkspaceMemberDetailRow
                icon={User}
                label="Invited user"
                value={invitation.user?.fullName ?? 'Not registered'}
              />

              <WorkspaceMemberDetailRow
                icon={User}
                label="Invited by"
                value={invitation.inviter.fullName}
              />

              <WorkspaceMemberDetailRow icon={Shield} label="Role" value={invitation.role.name} />

              <WorkspaceMemberDetailRow icon={Clock3} label="Status" value={invitation.status} />

              <WorkspaceMemberDetailRow
                icon={CalendarDays}
                label="Created"
                value={new Date(invitation.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />

              <WorkspaceMemberDetailRow
                icon={CalendarDays}
                label="Expires"
                value={new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
            </div>

            <SheetFooter className="gap-2 border-t pt-4">
              {invitation.status === 'PENDING' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const invitationUrl = `${config.NEXT_PUBLIC_APP_URL}/dashboard/w/${invitation.workspace.slug}/settings/invitations/accept?token=${invitation.token}&workspaceId=${workspaceId}&invitationId=${invitation.id}&slug=${invitation.workspace.slug}`;
                  
                    copyToClipboard(invitationUrl);
                  
                  }}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy invitation link
                </Button>
              )}

              {invitation.status === 'PENDING' && (
                <>
                  <Button className="w-full" onClick={handleResendInvitation} disabled={loading}>
                    {loading ? 'Resending...' : 'Resend'}
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      revokeInvitation(invitation.id);
                    }}
                  >
                    {loading ? 'Revoking...' : 'Revoke Invitation'}
                  </Button>
                </>
              )}
            </SheetFooter>
          </>
        ) : (
          <div className="p-6 text-sm text-slate-500">Invitation not found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
