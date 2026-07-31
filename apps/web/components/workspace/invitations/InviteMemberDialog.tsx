'use client';

import { useState, useMemo } from 'react';
import { Mail, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useWorkspaceMemberRoles } from '@/hooks/queries/workspace/members/useWorkspaceMemberRoles';
import { useInviteWorkspaceMember } from '@/hooks/mutations/workspace/invitations/useInviteWorkspaceMember';
import { appToast } from '@/lib/toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  currentRole: string;
}

export default function InviteMemberDialog({
  open,
  onOpenChange,
  workspaceId,
  currentRole,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');

  const inviteMember = useInviteWorkspaceMember(workspaceId);

  const [selectedRoleId, setSelectedRoleId] = useState('');

  const { data: roles = [], isLoading: isLoadingRoles } = useWorkspaceMemberRoles(workspaceId);

  const availableRoles = useMemo(() => {
    switch (currentRole) {
      case 'OWNER':
        return roles;

      case 'ADMIN':
        return roles.filter((r) => r.name === 'MEMBER');

      case 'MEMBER':
        return roles.filter((r) => r.name === 'MEMBER');

      default:
        return [];
    }
  }, [roles, currentRole]);

  const defaultRoleId = useMemo(() => {
    return availableRoles.find((r) => r.name === 'MEMBER')?.id ?? availableRoles[0]?.id ?? '';
  }, [availableRoles]);

  const roleId = selectedRoleId || defaultRoleId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Email is required');

      return;
    }

    if (!roleId) {
      setError('Role is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await inviteMember.mutateAsync({
        email: normalizedEmail,
        roleId,
      });

      setEmail('');
      setSelectedRoleId('');
      onOpenChange(false);

      appToast.success('Workspace invitation sent successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>

          <DialogDescription>Invite someone to join this workspace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>

            <div className="relative">
              <Mail
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@example.com"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>

            <select
              value={roleId}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                focus:border-blue-500
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

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />

              {loading ? 'Sending...' : 'Send invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
