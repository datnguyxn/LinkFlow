'use client';

import { ArrowLeft, Download, Link2, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import CreateLinkDialog from './create/CreateLinkDialog';
import { useState } from 'react';

export default function LinksHeader({ slug }: { slug: string | undefined }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <div
        className="
        h-56
        bg-gradient-to-r
        from-slate-700
        via-blue-600
        to-violet-600
        pb-8
        px-8
        pt-4
        text-white
        shadow-lg
      "
      >
        {/* Navigation */}
        <div className="mb-4 flex items-center gap-2">
          <Link
            href={`/dashboard/w/${slug}`}
            className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            text-sm
            font-medium
            text-slate-500
            transition-all
            hover:text-slate-900
            dark:text-slate-400
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
          >
            <ArrowLeft className="h-4 w-4" />

            <span>Back to workspace</span>
          </Link>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left */}
          <div className="flex items-center gap-5">
            {/* Icon */}
            <div
              className="
              flex
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/20
              bg-white/15
              shadow-lg
              backdrop-blur-sm
            "
            >
              <Link2 className="h-10 w-10" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Links</h1>

              <p className="mt-2 max-w-xl text-sm text-white/80">
                Create, organize and manage all shortened URLs in your workspace. Track clicks,
                generate QR codes and monitor performance from one place.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Import / Export */}
            <div
              className="
            flex
            items-center
            rounded-xl
            border
            border-white/20
            bg-white/10
            backdrop-blur-md
            "
            >
              <Button
                variant="ghost"
                size="sm"
                className="
                    text-white
                    hover:bg-white/15
                    hover:text-white
                "
                title="Import"
              >
                <Upload className="h-4 w-4" />
              </Button>

              <div className="mx-1 h-5 w-px bg-white/20" />

              <Button
                variant="ghost"
                size="sm"
                className="
                text-white
                hover:bg-white/15
                hover:text-white"
                title="Export"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Create */}
            <Button
              className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/20
              bg-white/10
              px-4
              py-2.5
              text-sm
              font-medium
              backdrop-blur-sm
              transition
              hover:bg-white/20
              cursor-pointer
            "
              size="sm"
              onClick={() => {
                // Open create link dialog
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Button>
          </div>
        </div>
      </div>

      <CreateLinkDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
        }}
      />
    </>
  );
}
