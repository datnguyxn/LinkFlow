'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

import { WorkspaceDetail } from '@/types/workspace.type';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

import { appToast } from '@/lib/toast';
import { useUpdateWorkspace } from '@/hooks/mutations/workspace/useUpdateWorkspace';

export default function WorkspaceGeneralSettings({
  workspace,
}: {
  workspace: WorkspaceDetail;
}) {
  const [name, setName] = useState(workspace.name);

  const updateWorkspace = useUpdateWorkspace(workspace.id);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      appToast.error(
        'Workspace name is required',
      );

      return;
    }

    try {
      setSaving(true);

      TODO:
      await updateWorkspace.mutateAsync({
        name
      });

      appToast.success(
        'Workspace settings updated',
      );
    } catch (error) {
      console.error(error);

      appToast.error(
        'Failed to update workspace',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          General
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your workspace basic information.
        </p>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Workspace name
          </label>

          <Input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="My workspace"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Workspace slug
          </label>

          <div className="flex items-center">
            <span
              className="
                rounded-l-xl
                border
                border-r-0
                border-slate-200
                bg-slate-50
                px-3
                py-2
                text-sm
                text-slate-500
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              /w
            </span>

            <Input
              value={workspace.slug}
              disabled
              className="rounded-l-none"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />

            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </section>
  );
}