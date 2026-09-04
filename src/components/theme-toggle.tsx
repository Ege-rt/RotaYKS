"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: theme is only known client-side.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={compact ? "h-8 w-8" : "h-9 w-full"} />;
  }

  const isLight = theme === "light";

  if (compact) {
    return (
      <button
        onClick={() => setTheme(isLight ? "dark" : "light")}
        aria-label="Temayı değiştir"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-mist-500 transition-colors hover:bg-[var(--hover-tint)] hover:text-mist-100"
      >
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="flex w-full items-center justify-between rounded-2xl border border-line bg-ink-900/40 px-3.5 py-2 text-xs font-medium text-mist-300 transition-colors hover:bg-[var(--hover-tint)]"
    >
      <span className="flex items-center gap-2">
        {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        {isLight ? "Aydınlık Tema" : "Karanlık Tema"}
      </span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          isLight ? "bg-violet-500/30" : "bg-violet-500/50"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-violet-400 transition-transform ${
            isLight ? "translate-x-0.5" : "translate-x-4"
          }`}
        />
      </span>
    </button>
  );
}
