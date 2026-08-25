'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';

export default function LinkTableSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <Table>
        <TableBody>
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="w-12">
                <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </TableCell>

              <TableCell>
                <div className="flex gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                    <div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

                    <div className="h-3 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              </TableCell>

              <TableCell>
                <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </TableCell>

              <TableCell>
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </TableCell>

              <TableCell>
                <div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}