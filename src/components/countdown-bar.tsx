"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, minutes, passed: false };
}

function fmt(t: { days: number; hours: number; minutes: number; passed: boolean }) {
  if (t.passed) return "geçti";
  return `${t.days}g ${t.hours}s ${t.minutes}dk`;
}

export function CountdownBar() {
  const [dates, setDates] = useState<{ tytDate: string; aytDate: string } | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setDates({ tytDate: d.tytDate, aytDate: d.aytDate }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!dates) return null;

  const tyt = getTimeLeft(dates.tytDate);
  const ayt = getTimeLeft(dates.aytDate);

  return (
    <div className="sticky top-0 z-10 border-b border-line bg-ink-900/70 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-4 py-2 sm:px-8">
        <div className="flex items-center gap-3 text-[11px] text-mist-500 sm:gap-5 sm:text-[12px]">
          <span className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"
              style={{ boxShadow: "0 0 8px #9B72FF" }}
            />
            <span className="hidden sm:inline">TYT&apos;ye</span>
            <span className="sm:hidden">TYT</span>{" "}
            <span className="stat-number text-mist-100">{fmt(tyt)}</span>
          </span>
          <span className="h-3 w-px bg-line" />
          <span className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-good"
              style={{ boxShadow: "0 0 8px #3DDC9A" }}
            />
            <span className="hidden sm:inline">AYT&apos;ye</span>
            <span className="sm:hidden">AYT</span>{" "}
            <span className="stat-number text-mist-100">{fmt(ayt)}</span>
          </span>
        </div>
        <Link
          href="/settings"
          className="absolute right-4 text-mist-700 transition-colors hover:text-violet-300 sm:right-8"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
