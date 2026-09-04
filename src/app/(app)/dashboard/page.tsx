"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { TrendingUp, TrendingDown, Minus, Video, ListChecks, Award, Clock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GoalBanner } from "@/components/goal-banner";
import { GoalPickerModal } from "@/components/goal-picker-modal";
import { StreakBadge } from "@/components/streak-badge";
import { calculateStreak } from "@/lib/streak";
import { computeAchievements } from "@/lib/achievements";
import type { Exam, Topic, Course, VideoItem, StudyEntry } from "@/lib/db";

type CourseWithVideos = Course & { videos: VideoItem[] };

const TYT_COLOR = "#9B72FF";
const AYT_COLOR = "#38BDF8";

type ChartPoint = {
  dateLabel: string;
  dateKey: string;
  tytNet?: number;
  tytName?: string;
  aytNet?: number;
  aytName?: string;
  aytTrack?: string;
};

function ExamChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="min-w-[220px] rounded-2xl border border-line bg-ink-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-mist-700">
        {label}
      </p>
      <div className="space-y-2.5">
        {point.tytNet !== undefined && (
          <div className="flex items-start gap-2.5">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ background: TYT_COLOR, boxShadow: `0 0 8px ${TYT_COLOR}` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold" style={{ color: TYT_COLOR }}>
                  TYT
                </span>
                <span className="stat-number text-sm font-semibold text-white">
                  {point.tytNet} net
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11.5px] text-mist-500">{point.tytName}</p>
            </div>
          </div>
        )}
        {point.aytNet !== undefined && (
          <div className="flex items-start gap-2.5">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ background: AYT_COLOR, boxShadow: `0 0 8px ${AYT_COLOR}` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold" style={{ color: AYT_COLOR }}>
                  AYT{point.aytTrack ? ` · ${point.aytTrack}` : ""}
                </span>
                <span className="stat-number text-sm font-semibold text-white">
                  {point.aytNet} net
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11.5px] text-mist-500">{point.aytName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: { direction: "up" | "down" | "flat"; text: string };
}) {
  return (
    <div className="glass-panel p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="label-eyebrow">{label}</p>
        <Icon className="h-4 w-4 text-violet-300" />
      </div>
      <p className="stat-number mt-3 text-3xl text-white">{value}</p>
      {trend && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            trend.direction === "up"
              ? "text-good"
              : trend.direction === "down"
              ? "text-bad"
              : "text-mist-700"
          }`}
        >
          {trend.direction === "up" && <TrendingUp className="h-3.5 w-3.5" />}
          {trend.direction === "down" && <TrendingDown className="h-3.5 w-3.5" />}
          {trend.direction === "flat" && <Minus className="h-3.5 w-3.5" />}
          {trend.text}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<CourseWithVideos[]>([]);
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [goal, setGoal] = useState<{ targetUniversity: string; targetDepartment: string } | null>(
    null
  );
  const [firstTimePopup, setFirstTimePopup] = useState(false);

  const [activeSubject, setActiveSubject] = useState("Toplam");

  useEffect(() => {
    async function load() {
      const [examsRes, topicsRes, coursesRes, studyRes, goalRes] = await Promise.all([
        fetch("/api/exams").then((r) => r.json()),
        fetch("/api/topics").then((r) => r.json()),
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/study").then((r) => r.json()),
        fetch("/api/goal").then((r) => r.json()),
      ]);
      setExams(examsRes.exams || []);
      setTopics(topicsRes.topics || []);
      setCourses(coursesRes.courses || []);
      setStudyEntries(studyRes.entries || []);
      setGoal({
        targetUniversity: goalRes.targetUniversity || "",
        targetDepartment: goalRes.targetDepartment || "",
      });
      if (!goalRes.targetUniversity) setFirstTimePopup(true);
      setLoading(false);
    }
    load();
  }, []);

  const subjectTabs = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => Object.keys(e.subjectNets || {}).forEach((s) => set.add(s)));
    return ["Toplam", ...Array.from(set)];
  }, [exams]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const subject = activeSubject === "Toplam" ? null : activeSubject;
    const byDate = new Map<string, ChartPoint>();

    exams.forEach((e) => {
      const net = subject ? e.subjectNets?.[subject] : e.totalNet;
      if (net === undefined || net === null) return;

      if (!byDate.has(e.date)) {
        byDate.set(e.date, {
          dateKey: e.date,
          dateLabel: new Date(e.date).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
          }),
        });
      }
      const point = byDate.get(e.date)!;
      if (e.type === "TYT") {
        point.tytNet = net;
        point.tytName = e.name;
      } else {
        point.aytNet = net;
        point.aytName = e.name;
        point.aytTrack = e.track;
      }
    });

    return Array.from(byDate.values()).sort(
      (a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime()
    );
  }, [exams, activeSubject]);

  const tytAvg = useMemo(() => {
    const values = chartData.filter((d) => d.tytNet !== undefined).map((d) => d.tytNet as number);
    return values.length ? (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1) : null;
  }, [chartData]);

  const aytAvg = useMemo(() => {
    const values = chartData.filter((d) => d.aytNet !== undefined).map((d) => d.aytNet as number);
    return values.length ? (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1) : null;
  }, [chartData]);

  const lastExam = exams[exams.length - 1];
  const prevExam = exams[exams.length - 2];
  const highestExam = exams.reduce<Exam | undefined>(
    (max, e) => (!max || e.totalNet > max.totalNet ? e : max),
    undefined
  );

  let trend: { direction: "up" | "down" | "flat"; text: string } | undefined;
  if (lastExam && prevExam) {
    const diff = Math.round((lastExam.totalNet - prevExam.totalNet) * 10) / 10;
    trend = {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
      text: `${diff > 0 ? "+" : ""}${diff} önceki denemeye göre`,
    };
  }

  const topicsTotal = topics.length;
  const topicsDone = topics.filter((t) => t.status === "Tamamlandı").length;
  const topicPct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;

  const allVideos = courses.flatMap((c) => c.videos || []);
  const videoPct = allVideos.length
    ? Math.round((allVideos.filter((v) => v.watched).length / allVideos.length) * 100)
    : 0;

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  }).map((d) => format(d, "yyyy-MM-dd"));
  const weeklyHours =
    Math.round(
      studyEntries.filter((e) => weekDays.includes(e.date)).reduce((s, e) => s + e.hours, 0) * 100
    ) / 100;

  const streak = useMemo(() => calculateStreak(studyEntries), [studyEntries]);
  const achievements = useMemo(
    () => computeAchievements({ studyEntries, exams, topics }),
    [studyEntries, exams, topics]
  );
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Genel Bakış"
        title="Rota panelin"
        description="Deneme netlerin, konu ilerlemen ve video takibin tek bakışta."
        action={
          !loading && (
            <div className="flex items-center gap-2">
              <StreakBadge streak={streak} />
              <Link
                href="/achievements"
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
              >
                <Trophy className="h-3.5 w-3.5" />
                {unlockedAchievements} Rozet
              </Link>
            </div>
          )
        }
      />

      {goal?.targetUniversity && (
        <GoalBanner
          university={goal.targetUniversity}
          department={goal.targetDepartment}
          onChange={(u, d) => setGoal({ targetUniversity: u, targetDepartment: d })}
        />
      )}

      <GoalPickerModal
        open={firstTimePopup}
        onClose={() => setFirstTimePopup(false)}
        allowSkip
        onSaved={(u, d) => setGoal({ targetUniversity: u, targetDepartment: d })}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-panel h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Son Deneme Neti"
              value={lastExam ? lastExam.totalNet.toString() : "—"}
              icon={Award}
              trend={trend}
            />
            <StatCard
              label="En Yüksek Net"
              value={highestExam ? highestExam.totalNet.toString() : "—"}
              icon={TrendingUp}
            />
            <StatCard label="Konu İlerlemesi" value={`%${topicPct}`} icon={ListChecks} />
            <StatCard label="İzlenen Video" value={`%${videoPct}`} icon={Video} />
            <StatCard label="Bu Hafta Çalışma" value={`${weeklyHours} sa`} icon={Clock} />
          </div>

          <div className="glass-panel mt-6 p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="label-eyebrow">Net Gelişimi</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-white">
                  {activeSubject === "Toplam" ? "TYT / AYT net zaman çizelgesi" : `${activeSubject} neti`}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: TYT_COLOR, boxShadow: `0 0 6px ${TYT_COLOR}` }}
                  />
                  <span className="text-xs text-mist-500">
                    TYT{tytAvg && <span className="ml-1 text-white">· Ort {tytAvg}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: AYT_COLOR, boxShadow: `0 0 6px ${AYT_COLOR}` }}
                  />
                  <span className="text-xs text-mist-500">
                    AYT{aytAvg && <span className="ml-1 text-white">· Ort {aytAvg}</span>}
                  </span>
                </div>
              </div>
            </div>

            {subjectTabs.length > 1 && (
              <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
                {subjectTabs.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSubject(s)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeSubject === s
                        ? "bg-violet-500/25 text-white border border-violet-400/30"
                        : "border border-line text-mist-500 hover:text-mist-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {chartData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-line text-center">
                <p className="text-sm text-mist-500">Henüz deneme eklenmedi.</p>
                <p className="mt-1 text-xs text-mist-700">
                  Deneme Analizi sayfasından ilk denemeni ekle.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <filter id="lineGlowTyt" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={TYT_COLOR} floodOpacity="0.55" />
                    </filter>
                    <filter id="lineGlowAyt" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={AYT_COLOR} floodOpacity="0.55" />
                    </filter>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    content={ExamChartTooltip}
                    cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tytNet"
                    name="TYT"
                    stroke={TYT_COLOR}
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 3.5, fill: "#0F0C1A", stroke: TYT_COLOR, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: TYT_COLOR, stroke: "#0F0C1A", strokeWidth: 2 }}
                    style={{ filter: "url(#lineGlowTyt)" }}
                    animationDuration={700}
                  />
                  <Line
                    type="monotone"
                    dataKey="aytNet"
                    name="AYT"
                    stroke={AYT_COLOR}
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 3.5, fill: "#0F0C1A", stroke: AYT_COLOR, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: AYT_COLOR, stroke: "#0F0C1A", strokeWidth: 2 }}
                    style={{ filter: "url(#lineGlowAyt)" }}
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
