export default function WorkspaceStatusBadge({
  status,
}: {
  status: string;
}) {
  const isActive = status === 'ACTIVE';
  const isLeft = status === 'LEFT';
  const isRemoved = status === 'REMOVED';

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ${
          isActive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            : isLeft || isRemoved
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${isActive ? 'bg-emerald-500' : isLeft || isRemoved ? 'bg-slate-400' : 'bg-yellow-500'}
        `}
      />

      {status}
    </span>
  );
}