'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import LinkRow from './LinkRow';
import LinkPagination from './LinkPagination';
import LinkTableSkeleton from './LinkTableSkeleton';
import LinkEmptyState from './LinkEmptyState';

import { Pagination } from '@/types/pagination.type';
import { Url } from '@/types/url.type';

interface Props {
  links: Url[];
  loading?: boolean;

  pagination?: Pagination;

  selectedLinks: string[];
  onSelectLink: (
    id: string,
    checked: boolean,
  ) => void;

  onSelectAll: (
    checked: boolean,
  ) => void;
}

export default function LinksTable({
  links,
  loading,
  pagination
}: Props) {
  if (loading) {
    return <LinkTableSkeleton />;
  }

  if (!links.length) {
    return <LinkEmptyState />;
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-lg
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          px-8
          py-6
          dark:border-slate-800
        "
      >
        <h2 className="text-lg font-bold">
          Links List
        </h2>

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            px-4
            py-2
            text-sm
            font-medium
            text-blue-600
          "
        >
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />

          {links.length} item
          {links.length > 1 ? 's' : ''} visible
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow
            className="
              h-16
              border-b
              bg-slate-50
              hover:bg-slate-50
              dark:bg-slate-950
            "
          >
            <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Link
            </TableHead>

            <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Original URL
            </TableHead>

            <TableHead className="px-5 py-3 text-xs text-center font-semibold uppercase tracking-wide text-slate-500">
              Clicks
            </TableHead>

            <TableHead className="px-5 py-3 text-xs text-center font-semibold uppercase tracking-wide text-slate-500">
              Status
            </TableHead>

            <TableHead className="px-7 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
            </TableHead>

            <TableHead className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
            />
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div
          className="
            border-t
            border-slate-200
            bg-slate-50/50
            px-8
            py-5
            dark:border-slate-800
            dark:bg-slate-950/30
          "
        >
          <LinkPagination
            pagination={pagination}
          />
        </div>
      )}
    </div>
  );
}