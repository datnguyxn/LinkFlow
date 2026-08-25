'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Funnel, Search, X } from 'lucide-react';

import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

export default function LinkToolbar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-5">
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-blue-600
              dark:bg-blue-500/10
            "
          >
            <Funnel className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-1xl font-bold">Advanced Filters</h2>

            <p className="mt-1 text-sm text-slate-500">
              Refine your search to find specific links.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Button variant="ghost" className=" h-10 rounded-xl px-5 text-slate-500">
            <X className="mr-2 text-sm h-4 w-4" />
            <span className="text-sm">Clear filters</span>
          </Button>

          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl px-5"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              {expanded ? 'Hide filters' : 'Show filters'}

              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </span>
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-6 dark:border-slate-800">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/40">
            {/* Search row */}
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Search className="h-4 w-4 text-slate-500" />
                  Search
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    placeholder="Search title, slug or original URL..."
                    className="h-10 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="mb-2 text-sm font-semibold">Status</label>

                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option>All status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Expired</option>
                  <option>Archived</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="mb-2 text-sm font-semibold">Sort</label>

                <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Most clicks</option>
                  <option>Most recent</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Start date
                </label>

                <Input type="date" className="h-10 rounded-xl" />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  End date
                </label>

                <Input type="date" className="h-10 rounded-xl" />
              </div>

              <div className="flex items-end">
                <Button className="h-10 w-full rounded-xl">Apply filters</Button>
              </div>
            </div>

            {/* Quick filters */}

            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">Quick filters</p>

              <div className="flex flex-wrap gap-2">
                <button className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200">
                  Today
                </button>

                <button className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200">
                  This week
                </button>

                <button className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-200">
                  This month
                </button>

                <button className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-200">
                  Active
                </button>

                <button className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-200">
                  Inactive
                </button>

                <button className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-200">
                  Expired
                </button>

                <button className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
                  Archived
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
