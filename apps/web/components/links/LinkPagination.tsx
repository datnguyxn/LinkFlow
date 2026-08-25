'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import Button from '@/components/ui/button';

import { Pagination } from '@/types/pagination.type';

interface Props {
  pagination: Pagination;

  onPageChange?(
    page: number,
  ): void;
}

export default function LinkPagination({
  pagination,
  onPageChange,
}: Props) {
  const {
    page,
    totalPages,
    totalItems,
    limit,
  } = pagination;

  const start =
    (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    totalItems,
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {totalItems}
        </span>{" "}
        links
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={!pagination.hasPrevious}
          onClick={() =>
            onPageChange?.(page - 1)
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({
            length: totalPages,
          }).map((_, index) => {
            const value = index + 1;

            return (
              <Button
                key={value}
                size="icon"
                variant={
                  value === page
                    ? 'default'
                    : 'ghost'
                }
                onClick={() =>
                  onPageChange?.(value)
                }
              >
                {value}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={!pagination.hasNext}
          onClick={() =>
            onPageChange?.(page + 1)
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}