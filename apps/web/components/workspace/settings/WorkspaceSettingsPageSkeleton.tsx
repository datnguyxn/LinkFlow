export default function WorkspaceSettingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="h-40 animate-pulse bg-slate-200 dark:bg-slate-800" />

      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {/* General settings */}
        <div className="h-[480px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />

        {/* Danger zone */}
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </main>
    </div>
  );
}