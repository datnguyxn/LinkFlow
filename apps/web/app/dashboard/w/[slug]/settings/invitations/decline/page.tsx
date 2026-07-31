'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { appToast } from '@/lib/toast';
import { useDeclineWorkspaceInvitation } from '@/hooks/mutations/workspace/invitations/useDeclineWorkspaceInvitation';

export default function DeclineInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const workspaceId = searchParams.get('workspaceId');
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');

  const declineInvitation = useDeclineWorkspaceInvitation();

  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) {
      return;
    }

    if (!workspaceId || !token) {
      appToast.error('Invalid invitation link');
      router.replace('/dashboard');
      return;
    }

    hasRequested.current = true;

    (async () => {
      try {
        await declineInvitation.mutateAsync({
          workspaceId,
          token,
        });

        appToast.success('Invitation declined successfully');

        router.replace(`/dashboard`);
      } catch (error) {
        console.error(error);

        appToast.error('Failed to decline invitation');

        router.replace('/dashboard');
      }
    })();
  }, [workspaceId, token, slug, router, declineInvitation]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">Declining invitation...</h1>

        <p className="text-sm text-slate-500">Please wait while we process your request.</p>
      </div>
    </div>
  );
}
