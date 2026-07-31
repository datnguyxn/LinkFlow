'use client';

import { usePathname } from 'next/navigation';

import { WorkspaceContext } from '@/contexts/workspace.context';
import { useAuthContext } from '@/contexts/auth.context';
import { useWorkspaces } from '@/hooks/queries/workspace/useWorkspaces';
import { useWorkspaceDetail } from '@/hooks/queries/workspace/useWorkspaceDetail';

export default function WorkspaceProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const { authenticated } = useAuthContext();

  const { data: workspaces = [], isLoading, error } = useWorkspaces(authenticated);

  const currentWorkspace = workspaces.find((workspace) => workspace.slug === slug);

  const workspaceId = currentWorkspace?.id;

  const {
    data: workspaceDetail,
    isLoading: detailLoading,
    error: detailError,
  } = useWorkspaceDetail(workspaceId || '', authenticated && !!workspaceId);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace: workspaceDetail ?? null,
        loading: isLoading || detailLoading,
        error: error || detailError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
