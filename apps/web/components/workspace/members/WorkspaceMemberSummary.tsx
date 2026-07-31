export default function WorkspaceMemberSummary({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconClassName: string;
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 px-5 first:pl-0 last:pr-0">
      <Icon className={`h-5 w-5 ${iconClassName}`} />

      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
