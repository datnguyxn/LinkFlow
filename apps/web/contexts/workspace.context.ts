import { createContext, useContext } from 'react';

import { Workspace, WorkspaceDetail } from '@/types/workspace.type';

interface WorkspaceContextValue {
  workspaces: Workspace[];

  currentWorkspace: WorkspaceDetail | null;

  loading: boolean;

  error: Error | null;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | undefined>(
    undefined,
  );

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      'useWorkspaceContext must be used within WorkspaceProvider',
    );
  }

  return context;
}