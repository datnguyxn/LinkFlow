'use client';

import LinksPage from '@/components/links/LinksPage';

import { useWorkspaceContext } from '@/contexts/workspace.context';

import LinksPageSkeleton from '@/components/links/LinksPageSkeleton';

export default function WorkspaceLinksPage() {
  const { currentWorkspace, loading } = useWorkspaceContext();

  if (loading || !currentWorkspace) {
    return <LinksPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <LinksPage workspaceId={currentWorkspace?.id} slug={currentWorkspace?.slug} />
    </div>
  );
}
