"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-slate-300
        transition
        hover:bg-slate-100
        dark:border-slate-700
        dark:hover:bg-slate-800
        dark:bg-slate-900
        cursor-pointer
      "
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}