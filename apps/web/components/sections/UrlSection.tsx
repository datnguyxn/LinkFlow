'use client';

import {
  Link2,
  Type,
} from 'lucide-react';

import Input from '@/components/ui/Input';

interface UrlSectionProps {
  value: string;
  onChange: (value: string) => void;
}


export default function UrlSection({
  value,
  onChange,
}: UrlSectionProps) {
  return (
    <section
      className="
        rounded-xl
        border
        border-blue-200
        bg-gradient-to-br
        from-blue-50
        via-white
        to-blue-50
        p-7
        shadow-sm
        dark:border-blue-900/40
        dark:from-slate-900
        dark:via-slate-900
        dark:to-slate-950
      "
    >
      {/* Header */}

      <div className="flex items-start gap-5">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-indigo-700
            to-cyan-500
            text-white
            shadow-lg
          "
        >
          <Link2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-bold">
            Website URL
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Paste the full address you want to shorten.
          </p>
        </div>
      </div>

      {/* URL */}

      <div className="mt-8">
        <label className="mb-2 block text-sm font-semibold">
          URL
        </label>

        <div className="relative">
          <Input
            placeholder="https://example.com/page"
            className="
              h-14
              rounded-2xl
              border-slate-300
              pr-20
              text-base
            "
            onChange={(e) => onChange(e.target.value)}
          />

          <span
            className="
              absolute
              bottom-4
              right-5
              text-xs
              font-medium
              text-slate-400
            "
          >
            {value.length}/2048
          </span>
        </div>
      </div>

      {/* Title */}

      <div className="mt-8">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Type className="h-4 w-4 text-slate-500" />

          Title
          <span className="font-normal text-slate-400">
            (Optional)
          </span>
        </label>

        <div className="relative">
          <Input
            placeholder="e.g. Summer Campaign Landing"
            className="
              h-14
              rounded-2xl
              border-slate-300
              pr-20
              text-base
            "
          />

          <span
            className="
              absolute
              bottom-4
              right-5
              text-xs
              font-medium
              text-slate-400
            "
          >
            0/128
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          A friendly title to identify the link.
        </p>
      </div>
    </section>
  );
}