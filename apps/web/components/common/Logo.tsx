import { Link2 } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-gradient-to-br
        from-blue-600
        to-sky-400
        text-white
      "
      >
        <Link2 size={20} />
      </div>

      <span className="text-xl font-bold tracking-tight">
        LinkFlow
      </span>
    </div>
  );
}