'use client';

import { useMemo, useState } from 'react';

import { Plus, Search } from 'lucide-react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import WorkspaceList from '@/components/workspace/manage/WorkspaceList';
import WorkspaceManagementSkeleton from '@/components/workspace/manage/WorkspaceManagementSkeleton';
import CreateWorkspaceDialog from '@/components/workspace/create/CreateWorkspaceDialog';
import { useWorkspaceContext } from '@/contexts/workspace.context';

export default function ManageWorkspacesPage() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const { workspaces, loading } = useWorkspaceContext();

  const [search, setSearch] = useState('');

  const filteredWorkspaces = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return workspaces;
    }

    return workspaces.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(keyword) ||
        workspace.slug.toLowerCase().includes(keyword),
    );
  }, [workspaces, search]);

  if (loading) {
    return <WorkspaceManagementSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-8 py-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Workspaces</h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Create and manage all your workspaces.
                </p>
              </div>

              <Button className="rounded-xl" onClick={() => setOpenCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">
          {/* Search */}
          <div className="relative max-w-md">
            <Search
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workspaces..."
              className="pl-9"
            />
          </div>

          {/* Workspace count */}
          <div>
            <p className="text-sm text-slate-500">
              {filteredWorkspaces.length} workspace
              {filteredWorkspaces.length !== 1 && 's'}
            </p>
          </div>

          {/* List */}
          <WorkspaceList workspaces={filteredWorkspaces} />
        </main>
      </div>

      <CreateWorkspaceDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog} />
    </>
  );
}
