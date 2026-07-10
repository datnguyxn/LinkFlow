import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({ title, description, icon: Icon }: Props) {
  return (
    <div
      className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-6
      duration-300
      shadow-xl
      transition
      hover:-translate-y-2
      hover:shadow-xl
      dark:border-slate-700
      dark:bg-slate-900
      dark:shadow-none
    "
    >
      <div
        className="
        mb-5
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-xl
        bg-blue-100
        text-blue-600
      "
      >
        <Icon size={22} />
      </div>

      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
