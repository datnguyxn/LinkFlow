'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useSidebarStore } from '@/stores/sidebar.store';

export default function SidebarCollapseButton() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);

  return (
    <button
      onClick={toggle}
      className="
        absolute
        -right-4
        top-8
        z-50
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        border
        border-slate-200
        bg-white
        shadow-md
        transition
        hover:bg-slate-100
        dark:border-slate-700
        dark:bg-slate-800
        dark:hover:bg-slate-700
      "
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  );
}