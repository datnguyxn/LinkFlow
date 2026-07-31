'use client';

import { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import { appToast } from '@/lib/toast';
import { useCreateWorkspace } from '@/hooks/mutations/workspace/useCreateWorkspace';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');

  const createWorkspace = useCreateWorkspace();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const workspaceName = name.trim();

    if (!workspaceName) {
      appToast.error('Workspace name is required');
      return;
    }

    try {
      await createWorkspace.mutateAsync({
        name: workspaceName,
      });

      appToast.success('Workspace created successfully');

      setName('');
      onOpenChange(false);
    } catch (error) {
      console.error(error);

      appToast.error('Failed to create workspace');
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setName('');
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-0
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900
          sm:max-w-md
        "
      >
        {/* Header */}
        <DialogHeader
          className="
            border-b
            border-slate-200
            px-6
            py-5
            dark:border-slate-800
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                dark:bg-blue-500/10
                dark:text-blue-400
              "
            >
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold">Create workspace</DialogTitle>

              <DialogDescription className="mt-1 text-sm">
                Create a workspace to organize your links and team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 px-6 py-6">
            <label
              htmlFor="workspace-name"
              className="text-sm font-medium text-slate-900 dark:text-white"
            >
              Workspace name
            </label>

            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. My Company"
              autoFocus
              disabled={createWorkspace.isPending}
            />

            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can change your workspace settings later.
            </p>
          </div>

          {/* Footer */}
          <DialogFooter
            className="
              flex
              flex-row
              justify-end
              gap-3
              border-t
              border-slate-200
              bg-slate-50
              px-6
              py-4
              dark:border-slate-800
              dark:bg-slate-950/50
              -mb-1
            "
          >
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => handleOpenChange(false)}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="rounded-xl"
              disabled={createWorkspace.isPending || !name.trim()}
            >
              {createWorkspace.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
