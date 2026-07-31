'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link2, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';

import { WorkspaceDetail } from '@/types/workspace.type';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';
import WorkspaceAvatar from '@/components/layouts/sidebar/WorkspaceAvatar';
import { appToast } from '@/lib/toast';
import { useUploadWorkspaceLogo } from '@/hooks/mutations/workspace/useUploadWorkspaceLogo';
import { useDeleteWorkspaceLogo } from '@/hooks/mutations/workspace/useDeleteWorkspaceLogo';

interface WorkspaceBrandingSettingsProps {
  workspace: WorkspaceDetail;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function WorkspaceBrandingSettings({
  workspace,
}: WorkspaceBrandingSettingsProps) {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const uploadLogoMutation = useUploadWorkspaceLogo(workspace.id);
  const deleteLogoMutation = useDeleteWorkspaceLogo(workspace.id);

  /**
   * Preview for uploaded file.
   */
  const filePreviewUrl = useMemo(() => {
    if (!logo) {
      return null;
    }

    return URL.createObjectURL(logo);
  }, [logo]);

  /**
   * Cleanup object URL.
   */
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  /**
   * Priority:
   *
   * 1. Remove logo
   * 2. Uploaded file
   * 3. Image URL
   * 4. Existing workspace logo
   */
  const previewUrl = removeLogo
    ? null
    : filePreviewUrl || logoUrl.trim() || workspace.logoUrl;

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      event.target.value = '';
      return;
    }

    setLogo(file);

    uploadLogoMutation.mutate({ file, logoUrl: null }, {
      onSuccess: () => {
        appToast.success('Workspace logo updated successfully.');
      },
      onError: () => {
        appToast.error('Failed to update workspace logo.');
      },
    });

    // Upload file => clear image URL
    setLogoUrl('');

    setRemoveLogo(false);
  };

  const handleLogoUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setLogoUrl(value);

    uploadLogoMutation.mutate({ file: null, logoUrl: value }, {
      onSuccess: () => {
        appToast.success('Workspace logo updated successfully.');
      },
      onError: () => {
        appToast.error('Failed to update workspace logo.');
      },
    });

    // Image URL => clear uploaded file
    if (value.trim()) {
      setLogo(null);
    }

    setRemoveLogo(false);
  };

  const handleRemoveUploadedLogo = () => {
    setLogo(null);

    deleteLogoMutation.mutate(undefined, {
      onSuccess: () => {
        appToast.success('Workspace logo removed successfully.');
      },
      onError: () => {
        appToast.error('Failed to remove workspace logo.');
      },
    });

  };

  const logoUndo = workspace.logoUrl;

  const handleDeleteLogo = () => {
    setLogo(null);
    setLogoUrl('');
    setRemoveLogo(true);

    deleteLogoMutation.mutate(undefined, {
      onSuccess: () => {
        appToast.success('Workspace logo removed successfully.');
      },
      onError: () => {
        appToast.error('Failed to remove workspace logo.');
      },
    });
  };

  const handleUndoDelete = () => {
    setRemoveLogo(false);

    uploadLogoMutation.mutate({ file: null, logoUrl: logoUndo || workspace.logoUrl }, {
      onSuccess: () => {
        appToast.success('Workspace logo restored successfully.');
      },
      onError: () => {
        appToast.error('Failed to restore workspace logo.');
      },
    });
  };

  const handleClearLogoUrl = () => {
    setLogoUrl('');

    deleteLogoMutation.mutate(undefined, {
      onSuccess: () => {
        appToast.success('Workspace logo removed successfully.');
      },
      onError: () => {
        appToast.error('Failed to remove workspace logo.');
      },
    });
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
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Branding
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Customize how your workspace looks.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        {/* Preview */}
        <div className="flex justify-center lg:justify-start">
          <div className="shrink-0">
            {previewUrl ? (
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt={`${workspace.name} logo`}
                  width={96}
                  height={96}
                  unoptimized={Boolean(filePreviewUrl)}
                  className="
                    h-24
                    w-24
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    object-cover
                    shadow-sm
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />

                {(logo || logoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogo(null);
                      setLogoUrl('');
                    }}
                    className="
                      absolute
                      -right-2
                      -top-2
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-slate-200
                      bg-white
                      text-slate-500
                      shadow-sm
                      transition
                      hover:text-red-500
                      dark:border-slate-700
                      dark:bg-slate-800
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <WorkspaceAvatar
                workspace={workspace}
                size="large"
              />
            )}
          </div>
        </div>

        {/* Form */}
        <div className="min-w-0 space-y-5">
          {/* Upload image */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
              <Upload className="h-4 w-4 text-slate-400" />
              Upload image
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                htmlFor="workspace-logo"
                className="
                  inline-flex
                  h-10
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <Upload className="h-4 w-4" />

                {logo ? 'Change image' : 'Choose image'}
              </label>

              <input
                id="workspace-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {logo && (
                <div className="flex min-w-0 items-center gap-2">
                  <span className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-300">
                    {logo.name}
                  </span>

                  <button
                    type="button"
                    onClick={handleRemoveUploadedLogo}
                    className="text-slate-400 transition hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              PNG, JPG or WebP. Maximum file size is 5MB.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              or
            </span>

            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Image address */}
          <div className="space-y-2">
            <label
              htmlFor="workspace-logo-url"
              className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white"
            >
              <Link2 className="h-4 w-4 text-slate-400" />
              Image address
            </label>

            <div className="relative">
              <Input
                id="workspace-logo-url"
                type="url"
                value={logoUrl}
                onChange={handleLogoUrlChange}
                placeholder="https://example.com/logo.png"
                className="h-10 pr-10"
              />

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleClearLogoUrl}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    transition
                    hover:text-red-500
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a publicly accessible image URL.
            </p>
          </div>

          {/* Delete current logo */}
          {workspace.logoUrl && !removeLogo && !logo && !logoUrl && (
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="
                  h-10
                  rounded-xl
                  border-red-200
                  text-red-600
                  hover:bg-red-50
                  hover:text-red-700
                  dark:border-red-900/50
                  dark:text-red-400
                  dark:hover:bg-red-950/30
                "
                onClick={handleDeleteLogo}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete current logo
              </Button>
            </div>
          )}

          {/* Undo delete */}
          {removeLogo && (
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                dark:border-red-900/50
                dark:bg-red-950/20
              "
            >
              <p className="text-sm text-red-600 dark:text-red-400">
                The workspace logo will be removed when you save.
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUndoDelete}
              >
                Undo
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}