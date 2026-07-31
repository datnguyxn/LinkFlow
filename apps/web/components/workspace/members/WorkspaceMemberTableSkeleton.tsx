export default function WorkspaceMemberTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-5 py-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

            <div className="h-3 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}