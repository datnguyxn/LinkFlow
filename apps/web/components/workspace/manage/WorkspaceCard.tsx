'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Copy,
  MoreHorizontal,
  Settings,
  Trash2,
} from 'lucide-react';

import { Workspace } from '@/types/workspace.type';

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

import { useDeleteWorkspace } from '@/hooks/mutations/workspace/useDeleteWorkspace';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { appToast } from '@/lib/toast';

export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const initial = workspace.name.charAt(0).toUpperCase();

  const deleteWorkspaceMutation = useDeleteWorkspace(workspace.id);
  const [open, setOpen] = useState(false);

  /**
   * Role lấy từ API
   *
   * OWNER
   * MEMBER
   */
  const isOwner = workspace.role.name === 'OWNER';

  const workspaceUrl = `/dashboard/w/${workspace.slug}`;

  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(workspace.slug);

      appToast.success('Workspace slug copied');
    } catch (error) {
      console.error(error);

      appToast.error('Failed to copy workspace slug');
    }
  };

  const handleDelete = () => {
    deleteWorkspaceMutation.mutate(undefined, {
      onSuccess: () => {
        appToast.success('Workspace deleted successfully.');

        setOpen(false);
      },

      onError: () => {
        appToast.error('Failed to delete workspace.');
      },
    });
  };

  return (
    <>
      <div
        className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-xl
        dark:border-slate-800
        dark:bg-slate-900
        dark:hover:border-blue-900
      "
      >
        {/* Top gradient */}
        <div
          className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-gradient-to-r
          from-blue-500
          via-violet-500
          to-purple-500
          opacity-0
          transition-opacity
          group-hover:opacity-100
        "
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            {/* Workspace information */}
            <Link href={workspaceUrl} className="flex min-w-0 items-center gap-4">
              {/* Logo */}
              <div
                className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-violet-600
                text-xl
                font-bold
                text-white
                shadow-md
                ring-4
                ring-blue-50
                dark:ring-blue-500/10
              "
              >
                {workspace.logoUrl ? (
                  <Image
                    src={workspace.logoUrl}
                    alt={workspace.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                  {workspace.name}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  @{workspace.slug}
                </p>
              </div>
            </Link>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                  dark:hover:bg-slate-800
                  dark:hover:text-slate-300
                "
                >
                  <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 dark:bg-slate-900">
                {/* Open */}
                <DropdownMenuItem asChild>
                  <Link
                    href={workspaceUrl}
                    className="flex cursor-pointer items-center gap-3 rounded-lg"
                  >
                    <ArrowUpRight className="h-4 w-4" />

                    <span>Open workspace</span>
                  </Link>
                </DropdownMenuItem>

                {/* Copy slug */}
                <DropdownMenuItem
                  onClick={handleCopySlug}
                  className="flex cursor-pointer items-center gap-3 rounded-lg"
                >
                  <Copy className="h-4 w-4" />

                  <span>Copy workspace slug</span>
                </DropdownMenuItem>

                {/* OWNER ONLY */}
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />

                    {/* Settings */}
                    <DropdownMenuItem asChild>
                      <Link
                        href={`${workspaceUrl}/settings`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg"
                      >
                        <Settings className="h-4 w-4" />

                        <span>Workspace settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Delete */}
                    <DropdownMenuItem
                      onClick={() => setOpen(true)}
                      className="
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      rounded-lg
                      text-red-600
                      focus:bg-red-50
                      focus:text-red-600
                      dark:focus:bg-red-950/30
                    "
                    >
                      <Trash2 className="h-4 w-4" />

                      <span>Delete workspace</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-slate-100 dark:border-slate-800" />

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-4 w-4" />

              <span>
                Created{' '}
                {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Role */}
            <span
              className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wide
              ${
                isOwner
                  ? `
                    bg-blue-50
                    text-blue-700
                    dark:bg-blue-500/10
                    dark:text-blue-400
                  `
                  : `
                    bg-slate-100
                    text-slate-600
                    dark:bg-slate-800
                    dark:text-slate-300
                  `
              }
            `}
            >
              {workspace.role.name}
            </span>
          </div>

          {/* Open action */}
          <Link
            href={workspaceUrl}
            className="
            mt-6
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            bg-slate-50
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-700
            transition
            group-hover:bg-blue-600
            group-hover:text-white
            dark:bg-slate-800
            dark:text-slate-200
            dark:group-hover:bg-blue-600
          "
          >
            <span>Open workspace</span>

            <ArrowUpRight
              className="
              h-4
              w-4
              transition-transform
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
            />
          </Link>
        </div>
      </div>

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
                handleDelete();
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
  );
}
