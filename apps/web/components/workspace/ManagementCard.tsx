import Link from 'next/dist/client/link';

export default function ManagementCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        transition-all
        hover:-translate-y-0.5
        hover:border-blue-300
        hover:shadow-md
        dark:border-slate-800
        dark:bg-slate-900
        dark:hover:border-blue-700
      "
    >
      <div
        className="
        mb-4
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        bg-blue-100
        text-blue-600
        transition
        group-hover:bg-blue-600
        group-hover:text-white
        dark:bg-blue-500/10
        dark:text-blue-400
      "
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
