"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  format,
  isToday,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import type { StudyEntry } from "@/lib/db";

const DAY_LABELS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function StudyPage() {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    fetch("/api/study")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setLoading(false);
      });
  }, []);

  const weekDays = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) }),
    [weekStart]
  );

  function hoursFor(date: Date) {
    const key = format(date, "yyyy-MM-dd");
    return entries.find((e) => e.date === key)?.hours ?? 0;
  }

  async function saveHours(date: Date, hours: number) {
    const key = format(date, "yyyy-MM-dd");
    const clamped = Math.max(0, Math.min(24, hours));
    setEntries((prev) => {
      const rest = prev.filter((e) => e.date !== key);
      return clamped > 0 ? [...rest, { id: key, userId: "", date: key, hours: clamped }] : rest;
    });
    await fetch("/api/study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: key, hours: clamped }),
    });
  }

  const weekTotal = useMemo(
    () => Math.round(weekDays.reduce((sum, d) => sum + hoursFor(d), 0) * 100) / 100,
    [weekDays, entries]
  );

  const today = new Date();
  const monthKey = format(today, "yyyy-MM");
  const prevMonthKey = format(subMonths(today, 1), "yyyy-MM");

  const monthTotal = useMemo(
    () =>
      Math.round(
        entries.filter((e) => e.date.startsWith(monthKey)).reduce((s, e) => s + e.hours, 0) * 100
      ) / 100,
    [entries, monthKey]
  );
  const prevMonthTotal = useMemo(
    () =>
      Math.round(
        entries.filter((e) => e.date.startsWith(prevMonthKey)).reduce((s, e) => s + e.hours, 0) *
          100
      ) / 100,
    [entries, prevMonthKey]
  );
  const monthDiff = Math.round((monthTotal - prevMonthTotal) * 10) / 10;

  const chartData = weekDays.map((d, i) => ({
    day: DAY_LABELS[i].slice(0, 3),
    saat: hoursFor(d),
  }));

  const rangeLabel = `${format(weekDays[0], "d MMM", { locale: tr })} – ${format(
    weekDays[6],
    "d MMM yyyy",
    { locale: tr }
  )}`;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Çalışma Takibi"
        title="Günlük çalışma saatlerin"
        description="Her gün ne kadar çalıştığını gir; haftalık ve aylık toplamlarını otomatik gör."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Week grid */}
        <div className="glass-panel overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <button
              onClick={() => setWeekStart((d) => subWeeks(d, 1))}
              className="rounded-lg p-1.5 text-mist-500 hover:bg-[var(--hover-tint)] hover:text-mist-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="font-display text-sm font-semibold text-mist-100">{rangeLabel}</p>
              <button
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                className="text-[11px] text-violet-300 hover:text-violet-200"
              >
                Bu haftaya dön
              </button>
            </div>
            <button
              onClick={() => setWeekStart((d) => addWeeks(d, 1))}
              className="rounded-lg p-1.5 text-mist-500 hover:bg-[var(--hover-tint)] hover:text-mist-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="h-64 animate-pulse rounded-2xl bg-ink-800/60" />
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {weekDays.map((d, i) => {
                const val = hoursFor(d);
                const todayFlag = isToday(d);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-4 px-6 py-3.5 ${
                      todayFlag ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {todayFlag && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"
                          style={{ boxShadow: "0 0 8px #9B72FF" }}
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-mist-100">{DAY_LABELS[i]}</p>
                        <p className="text-[11px] text-mist-700">
                          {format(d, "d MMMM", { locale: tr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        max={24}
                        defaultValue={val || ""}
                        key={`${format(d, "yyyy-MM-dd")}-${val}`}
                        onBlur={(e) => saveHours(d, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="glass-input w-20 text-center !py-1.5"
                      />
                      <span className="text-xs text-mist-700">saat</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line bg-violet-500/10 px-6 py-4">
            <span className="text-sm font-medium text-mist-300">Haftalık Toplam</span>
            <span className="stat-number text-2xl text-mist-100">{weekTotal} saat</span>
          </div>
        </div>

        {/* Side stats */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-eyebrow">Bu Hafta</p>
              <Clock className="h-4 w-4 text-violet-300" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F0C1A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#F7F6FA" }}
                  cursor={{ fill: "rgba(155,114,255,0.08)" }}
                />
                <Bar dataKey="saat" fill="#9B72FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-1 flex items-center justify-between">
              <p className="label-eyebrow">Bu Ay Toplam</p>
              <CalendarDays className="h-4 w-4 text-violet-300" />
            </div>
            <p className="stat-number mt-2 text-3xl text-mist-100">{monthTotal} saat</p>
            <div
              className={`mt-3 flex items-center gap-1.5 text-xs ${
                monthDiff > 0 ? "text-good" : monthDiff < 0 ? "text-bad" : "text-mist-700"
              }`}
            >
              {monthDiff > 0 && <TrendingUp className="h-3.5 w-3.5" />}
              {monthDiff < 0 && <TrendingDown className="h-3.5 w-3.5" />}
              {monthDiff === 0 && <Minus className="h-3.5 w-3.5" />}
              <span>
                {monthDiff > 0 ? "+" : ""}
                {monthDiff} saat geçen aya göre
              </span>
            </div>
            <p className="mt-1 text-[11px] text-mist-700">Geçen ay: {prevMonthTotal} saat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
