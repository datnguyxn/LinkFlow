"use client";

import { Languages } from "lucide-react";
import { useState } from "react";

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<"en" | "vi">("en");

  return (
    <button
      onClick={() =>
        setLanguage(language === "en" ? "vi" : "en")
      }
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <Languages className="h-4 w-4" />

      {language.toUpperCase()}
    </button>
  );
}