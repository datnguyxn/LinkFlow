export default function WorkspaceManagementSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="space-y-3">
              {/* Title */}
              <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

              {/* Description */}
              <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Create button */}
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        {/* Search */}
        <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

        {/* Workspace count */}
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

        {/* Workspace cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
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
              {/* Logo + role */}
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Workspace info */}
              <div className="mt-5 space-y-3">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
