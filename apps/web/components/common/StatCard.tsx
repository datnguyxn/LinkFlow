interface StatCardProps {
  title: string;
  value: string;
  color?: string;
}

export default function StatCard({ title, value, color = 'bg-blue-500' }: StatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        transition
        hover:shadow-lg
        dark:bg-slate-100
      
    "
    >
      <div className={`mb-4 h-2 w-12 rounded-full ${color}`} />

      <p className="text-sm text-slate-500 dark:text-slate-600 dark:text-black">{title}</p>

      <h3 className="mt-2 text-3xl font-bold dark:text-black">{value}</h3>
    </div>
  );
}
