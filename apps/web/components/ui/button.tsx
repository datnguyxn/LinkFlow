import { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({
  loading,
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      disabled={loading}
      className={cn(
        `
        flex
        h-14
        w-full
        items-center
        justify-center
        rounded-2xl
        bg-blue-600
        font-semibold
        text-white
        transition
        hover:bg-blue-700
        disabled:opacity-60
        cursor-pointer
      `,
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}