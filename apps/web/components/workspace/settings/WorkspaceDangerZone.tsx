'use client';

import { useState } from 'react';

import { AlertTriangle, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import PermissionGuard from '@/components/common/PermissionGuard';

import { WORKSPACE_PERMISSION } from '@/constants/permissions';

import { WorkspaceDetail } from '@/types/workspace.type';

import { useDeleteWorkspace } from '@/hooks/mutations/workspace/useDeleteWorkspace';

import { appToast } from '@/lib/toast';

import { useRouter } from 'next/navigation';

interface Props {
  workspace: WorkspaceDetail;
}

export default function WorkspaceDangerZone({ workspace }: Props) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const deleteWorkspaceMutation = useDeleteWorkspace(workspace.id);

  const handleDeleteWorkspace = () => {
    deleteWorkspaceMutation.mutate(undefined, {
      onSuccess: () => {
        appToast.success('Workspace deleted successfully.');

        setOpen(false);

        router.push('/dashboard');
      },

      onError: () => {
        appToast.error('Failed to delete workspace.');
      },
    });
  };

  return (
    <PermissionGuard permission={WORKSPACE_PERMISSION.WORKSPACE_DELETE}>
      <>
        <section
          className="
            rounded-2xl
            border
            border-red-200
            bg-white
            shadow-sm
            dark:border-red-900/50
            dark:bg-slate-900
          "
        >
          <div className="border-b border-red-200 p-6 dark:border-red-900/50">
            <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>

            <p className="mt-1 text-sm text-slate-500">Irreversible and destructive actions.</p>
          </div>

          <div className="flex items-center justify-between gap-6 p-6">
            <div>
              <h3 className="font-medium">Delete this workspace</h3>

              <p className="mt-1 text-sm text-slate-500">
                Once deleted, this workspace and all related data cannot be recovered.
              </p>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-200
                px-4
                py-2
                text-sm
                font-medium
                text-red-600
                transition
                hover:bg-red-50
                dark:border-red-900
                dark:hover:bg-red-950/30
                cursor-pointer
              "
            >
              <Trash2 className="h-4 w-4" />
              Delete workspace
            </button>
          </div>
        </section>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mb-2 flex justify-center">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-red-100
                    text-red-600
                    dark:bg-red-900/30
                  "
                >
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>

              <AlertDialogTitle className="text-center">Delete workspace?</AlertDialogTitle>

              <AlertDialogDescription className="text-center">
                You are about to permanently delete
                <span className="font-semibold"> {workspace.name}</span>
                .
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteWorkspaceMutation.isPending}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  handleDeleteWorkspace();
                }}
                disabled={deleteWorkspaceMutation.isPending}
                className="
                  bg-red-600
                  hover:bg-red-700
                  focus:ring-red-600
                "
              >
                {deleteWorkspaceMutation.isPending ? 'Deleting...' : 'Delete workspace'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </PermissionGuard>
  );
}
