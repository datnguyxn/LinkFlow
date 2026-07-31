'use client';

import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Button from '@/components/ui/button';

import { appToast } from '@/lib/toast';

import { WorkspaceMember } from '@/types/workspace.type';

import { useWorkspaceMemberRoles } from '@/hooks/queries/workspace/members/useWorkspaceMemberRoles';
import { useUpdateWorkspaceMemberRole } from '@/hooks/mutations/workspace/members/useUpdateWorkspaceMemberRole';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  member?: WorkspaceMember;
}

export default function UpdateMemberRoleDialog({ open, onOpenChange, workspaceId, member }: Props) {
  const { data: roles = [] } = useWorkspaceMemberRoles(workspaceId);

  const updateRole = useUpdateWorkspaceMemberRole(workspaceId, member?.userId ?? '');

  const [selectedRoleId, setSelectedRoleId] = useState(member?.role.id ?? '');

  const availableRoles = useMemo(() => {
    return roles.filter(
      (role) => role.name !== 'OWNER',
    );
  }, [roles]);


  const handleSubmit = async () => {
    if (!member) return;

    try {
      await updateRole.mutateAsync(selectedRoleId);

      appToast.success('Member role updated successfully.');

      onOpenChange(false);
    } catch {
      appToast.error('Failed to update member role.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update member role</DialogTitle>

          <DialogDescription>Change this member role.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">Member</label>

            <div className="mt-2 rounded-xl border p-3">
              <p className="font-medium">{member?.user.fullName}</p>

              <p className="text-sm text-slate-500">{member?.user.email}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>

            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="
                mt-2
                h-10
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updateRole.isPending || selectedRoleId === member?.role.id}
          >
            {updateRole.isPending ? 'Updating...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
