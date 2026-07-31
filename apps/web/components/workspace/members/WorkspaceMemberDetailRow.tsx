export default function WorkspaceMemberDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
      <Icon className="h-4 w-4 text-slate-400" />

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>

        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
