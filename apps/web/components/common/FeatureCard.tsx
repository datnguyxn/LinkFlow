import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
}: Props) {
  return (
    <div
      className="
      rounded-2xl
      border
      bg-white
      p-6
      transition-all
      duration-300
      hover:-translate-y-2
      hover:shadow-xl
      dark:bg-slate-100
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

      <h3 className="font-bold dark:text-black">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}