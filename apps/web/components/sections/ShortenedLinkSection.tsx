'use client';

import { Globe, Hash, Link2 } from 'lucide-react';

import Input from '@/components/ui/Input';

interface ShortenedLinkSectionProps {
  originalUrl: string;

  domain: string;
  slug: string;

  onDomainChange: (value: string) => void;
  onSlugChange: (value: string) => void;
}

const domains = ['linkflow.app', 'pageax.link', 'linkflow.link'];

export default function ShortenedLinkSection({
  originalUrl,
  domain,
  slug,
  onDomainChange,
  onSlugChange,
}: ShortenedLinkSectionProps) {
  const preview = `${domain}/${slug || 'auto-generated'}`;

  return (
    <section
      className="
        rounded-3xl
        border
        border-emerald-200
        bg-gradient-to-br
        from-emerald-50
        via-white
        to-green-50
        p-6
    "
    >
      {/* Header */}
      <div className="flex items-start gap-4">
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
            from-emerald-500
            to-green-500
            text-white
        "
        >
          <Hash className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Shortened link</h2>

          <p className="mt-1 text-sm text-slate-500">Choose the domain and customize the ending.</p>
        </div>
      </div>

      {/* Domain + Slug */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_30px_1fr]">
        <div>
          <label className="mb-2 block text-sm font-bold">Domain</label>

          <div className="relative">
            <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />

            <select
              value={domain}
              onChange={(e) => onDomainChange(e.target.value)}
              className="
                h-12
                w-full
                rounded-xl
                border
                bg-white
                pl-11
                pr-4
                text-sm
            "
            >
              {domains.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <span className="text-2xl font-light text-slate-400">/</span>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Slug</label>

          <Input
            value={slug}
            maxLength={32}
            placeholder="my-slug"
            className="h-12 rounded-xl text-sm"
            onChange={(e) => onSlugChange(e.target.value)}
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Auto generated if empty</span>
            <span>{slug.length}/32</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="
            mt-6
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-emerald-200
            bg-white/80
            px-5
            py-4
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-emerald-100
        "
        >
          <Link2 className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold">{preview}</p>

          <p className="truncate text-sm text-slate-500">{originalUrl}</p>
        </div>
      </div>
    </section>
  );
}
