'use client';

import Image from 'next/image';
import { Copy, Link2, MousePointerClick, Pencil, QrCode, Trash2 } from 'lucide-react';

import { TableCell, TableRow } from '@/components/ui/table';
import Button from '@/components/ui/button';

import LinkStatusBadge from './LinkStatusBadge';

import { Url } from '@/types/url.type';

interface Props {
  link: Url;
}

export default function LinkRow({ link }: Props) {
  const shortUrl = `https://linkflow.io/${link.shortCode}`;

  return (
    <TableRow className="h-24 hover:bg-slate-50 dark:hover:bg-slate-800/40">
      {/* Link */}
      <TableCell className="min-w-[320px]">
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-blue-600
              dark:bg-blue-950/40
            "
          >
            {link.faviconUrl ? (
              <Image
                src={link.faviconUrl}
                alt=""
                width={40}
                height={40}
                className="rounded-sm h-full w-full"
              />
            ) : (
              <Link2 className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">
              {link.title ?? "—"}
            </h3>

            <div className="mt-1 flex items-center gap-2">
              <span className="truncate text-sm text-blue-600">
                {shortUrl}
              </span>

              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg"
                onClick={() =>
                  navigator.clipboard.writeText(shortUrl)
                }
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Original URL */}
      <TableCell className="max-w-[280px]">
        <div className="truncate font-medium">
          {new URL(link.originalUrl).hostname}
        </div>

        <div className="truncate text-sm text-slate-500">
          {link.originalUrl}
        </div>
      </TableCell>

      {/* Clicks */}
      <TableCell className="max-w-[280px] text-center">
        <span className="font-semibold">
          {link.clickCount.toLocaleString()}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="max-w-[280px] text-center">
        <LinkStatusBadge status={link.status} />
      </TableCell>

      {/* Date */}
      <TableCell className="whitespace-nowrap font-medium">
        {new Date(link.createdAt).toLocaleDateString('en-GB')}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
          >
            <MousePointerClick className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
          >
            <QrCode className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}