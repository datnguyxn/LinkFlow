'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { appToast } from '@/lib/toast';
import { useAcceptWorkspaceInvitation } from '@/hooks/mutations/workspace/invitations/useAcceptWorkspaceInvitation';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const workspaceId = searchParams.get('workspaceId');
  const invitationId = searchParams.get('invitationId');
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');

  const acceptInvitation = useAcceptWorkspaceInvitation();

  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) {
      return;
    }

    if (!workspaceId || !invitationId || !token) {
      appToast.error('Invalid invitation link');
      router.replace('/dashboard');
      return;
    }

    hasRequested.current = true;

    (async () => {
      try {
        await acceptInvitation.mutateAsync({
            workspaceId,
            invitationId,
            token,
          });

        appToast.success(
          'Invitation accepted successfully',
        );

        router.replace(`/dashboard/w/${slug}`);
      } catch (error) {
        console.error(error);

        appToast.error(
          'Failed to accept invitation',
        );

        router.replace('/dashboard');
      }
    })();
  }, [
    workspaceId,
    invitationId,
    token,
    slug,
    router,
    acceptInvitation,
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">
          Accepting invitation...
        </h1>

        <p className="text-sm text-slate-500">
          Please wait while we add you to the workspace.
        </p>
      </div>
    </div>
  );
}