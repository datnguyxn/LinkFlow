'use client';

export default function LinksPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div
        className="
          h-56
          animate-pulse
          bg-gradient-to-r
          from-slate-300
          via-slate-200
          to-slate-300
          dark:from-slate-800
          dark:via-slate-700
          dark:to-slate-800
        "
      />

      <div className="mx-auto -mt-12 max-w-7xl space-y-8 px-6 pb-10">
        {/* Statistic cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="
                h-32
                animate-pulse
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                dark:border-slate-800
                dark:bg-slate-900
              "
            />
          ))}
        </div>

        {/* Toolbar */}
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="flex gap-3">
              <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Table */}
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
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 border-b px-6 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="
                grid
                grid-cols-6
                gap-4
                border-b
                px-6
                py-5
                last:border-none
              "
            >
              {Array.from({ length: 6 }).map((__, j) => (
                <div
                  key={j}
                  className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}