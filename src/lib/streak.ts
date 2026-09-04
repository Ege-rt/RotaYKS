import { format, subDays } from "date-fns";
import type { StudyEntry } from "./db";

/**
 * Consecutive-day study streak, counted backwards from today.
 * If today has no logged study yet, the streak still counts through
 * yesterday so it isn't reset to 0 the moment the clock passes midnight —
 * it only breaks once a full day is missed.
 */
export function calculateStreak(entries: StudyEntry[], today: Date = new Date()): number {
  const studiedDays = new Set(
    entries.filter((e) => (e.hours || 0) > 0).map((e) => e.date)
  );

  if (studiedDays.size === 0) return 0;

  const todayKey = format(today, "yyyy-MM-dd");
  let cursor = studiedDays.has(todayKey) ? today : subDays(today, 1);

  let streak = 0;
  while (studiedDays.has(format(cursor, "yyyy-MM-dd"))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}
