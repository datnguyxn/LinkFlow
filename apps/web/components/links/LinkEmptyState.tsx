'use client';

import {
  Link2,
  Plus,
} from 'lucide-react';

import Button from '@/components/ui/button';

interface Props {
  onCreate?(): void;
}

export default function LinkEmptyState({
  onCreate,
}: Props) {
  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-white
        p-10
        text-center
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <div
        className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-slate-100
          dark:bg-slate-800
        "
      >
        <Link2 className="h-10 w-10 text-slate-400" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        No links yet
      </h2>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        Create your first short link to
        start tracking clicks, generating
        QR codes and sharing links.
      </p>

      <Button
        className="mt-8"
        onClick={onCreate}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Link
      </Button>
    </div>
  );
}