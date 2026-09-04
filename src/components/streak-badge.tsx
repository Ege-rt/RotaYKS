import { Flame } from "lucide-react";

export function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
      <Flame className="h-3.5 w-3.5" />
      {streak} gün seri
    </div>
  );
}
