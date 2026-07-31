import { Workspace } from '@/types/workspace.type';

import WorkspaceCard from './WorkspaceCard';

export default function WorkspaceList({
  workspaces,
}: {
  workspaces: Workspace[];
}) {
  if (workspaces.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-dashed
          border-slate-300
          bg-white
          py-16
          text-center
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <h3 className="text-lg font-semibold">
          No workspaces found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try another search or create a new workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
        />
      ))}
    </div>
  );
}