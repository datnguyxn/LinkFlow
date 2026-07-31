'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Building2, Check, ChevronDown, Plus, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { Workspace, WorkspaceDetail } from '@/types/workspace.type';

import WorkspaceAvatar from './WorkspaceAvatar';
import SidebarWorkspaceListSkeleton from './SidebarWorkspaceListSkeleton';

interface SidebarWorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: WorkspaceDetail | null;
  loading: boolean;
  collapsed: boolean;
  onCreateWorkspace: () => void;
}

const MAX_VISIBLE_WORKSPACES = 4;

export default function SidebarWorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  loading,
  collapsed,
  onCreateWorkspace,
}: SidebarWorkspaceSwitcherProps) {
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();

  const filteredWorkspaces = useMemo(() => {
    // Không search
    if (!normalizedSearch) {
      return workspaces.slice(0, MAX_VISIBLE_WORKSPACES);
    }

    const matchedWorkspaces = workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(normalizedSearch),
    );

    /**
     * Luôn giữ workspace hiện tại
     * kể cả khi không match keyword
     */
    const currentWorkspaceItem = currentWorkspace
      ? workspaces.find((workspace) => workspace.id === currentWorkspace.id)
      : null;

    if (
      currentWorkspaceItem &&
      !matchedWorkspaces.some((workspace) => workspace.id === currentWorkspaceItem.id)
    ) {
      return [currentWorkspaceItem, ...matchedWorkspaces];
    }

    return matchedWorkspaces;
  }, [workspaces, currentWorkspace, normalizedSearch]);

  const hasMoreWorkspaces = !normalizedSearch && workspaces.length > MAX_VISIBLE_WORKSPACES;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearch('');
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      {/* Current workspace */}
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            `
              group
              mb-5
              flex
              w-full
              items-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-3
              text-left
              shadow-sm
              transition-all
              hover:border-slate-300
              hover:shadow-md
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:border-slate-600
            `,
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          <WorkspaceAvatar workspace={currentWorkspace} size="large" />

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {currentWorkspace?.name ?? 'Select workspace'}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {currentWorkspace ? 'Workspace' : 'Choose a workspace'}
                </p>
              </div>

              <ChevronDown
                className="
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                  transition-transform
                  group-data-[state=open]:rotate-180
                "
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent
        side={collapsed ? 'right' : 'bottom'}
        align="start"
        sideOffset={8}
        className="
          w-80
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-2
          shadow-xl
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        {/* Header */}
        <div className="px-3 pb-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your workspaces
          </p>
        </div>

        {/* Search */}
        {!loading && workspaces.length > MAX_VISIBLE_WORKSPACES && (
          <div
            className="relative mb-2 px-1"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
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

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
              placeholder="Search workspaces..."
              className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-3
                  text-sm
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                "
            />
          </div>
        )}

        {/* Workspace list */}
        <div className="space-y-1">
          {loading ? (
            <SidebarWorkspaceListSkeleton />
          ) : filteredWorkspaces.length > 0 ? (
            filteredWorkspaces.map((workspace) => {
              const isCurrent = currentWorkspace?.id === workspace.id;

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  asChild
                  className="
                    cursor-pointer
                    p-0
                    focus:bg-transparent
                  "
                >
                  <Link
                    href={`/dashboard/w/${workspace.slug}`}
                    className={cn(
                      `
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        transition-colors
                      `,
                      isCurrent
                        ? `
                          bg-blue-50
                          text-blue-700
                          dark:bg-blue-500/10
                          dark:text-blue-400
                        `
                        : `
                          hover:bg-slate-100
                          dark:hover:bg-slate-800
                        `,
                    )}
                  >
                    <WorkspaceAvatar workspace={workspace} active={isCurrent} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{workspace.name}</p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        @{workspace.slug}
                      </p>
                    </div>

                    {isCurrent && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-slate-500">No workspace found</p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Create workspace */}
        <DropdownMenuItem onClick={onCreateWorkspace} className="cursor-pointer rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-slate-300
                text-slate-500
                dark:border-slate-600
              "
            >
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium">Create workspace</p>

              <p className="text-xs text-slate-500">Start a new workspace</p>
            </div>
          </div>
        </DropdownMenuItem>

        {/* Manage workspaces */}
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-3">
          <Link href="/dashboard/w" className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-slate-600
                dark:bg-slate-800
                dark:text-slate-300
              "
            >
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium">Manage workspaces</p>

              <p className="text-xs text-slate-500">View and manage all workspaces</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
