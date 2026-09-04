"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Award, ListChecks, Flame, Lock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { computeAchievements, type Achievement, type AchievementCategory } from "@/lib/achievements";
import type { Exam, Topic, StudyEntry } from "@/lib/db";

const ICONS: Record<Achievement["icon"], React.ElementType> = {
  Clock,
  Award,
  ListChecks,
  Flame,
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  study: "Çalışma Saatleri",
  exam: "Denemeler",
  topic: "Konu Tamamlama",
  streak: "Çalışma Serisi",
};

const CATEGORY_ORDER: AchievementCategory[] = ["streak", "study", "exam", "topic"];

export default function AchievementsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [examsRes, topicsRes, studyRes] = await Promise.all([
        fetch("/api/exams").then((r) => r.json()),
        fetch("/api/topics").then((r) => r.json()),
        fetch("/api/study").then((r) => r.json()),
      ]);
      setExams(examsRes.exams || []);
      setTopics(topicsRes.topics || []);
      setStudyEntries(studyRes.entries || []);
      setLoading(false);
    }
    load();
  }, []);

  const achievements = useMemo(
    () => computeAchievements({ studyEntries, exams, topics }),
    [studyEntries, exams, topics]
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const grouped = useMemo(() => {
    const map = new Map<AchievementCategory, Achievement[]>();
    for (const category of CATEGORY_ORDER) map.set(category, []);
    achievements.forEach((a) => {
      map.get(a.category)?.push(a);
    });
    return map;
  }, [achievements]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Gamification"
        title="Rozetler"
        description={
          loading
            ? "Rozetlerin yükleniyor…"
            : `${unlockedCount}/${achievements.length} rozet kazandın. Çalıştıkça, deneme çözdükçe ve konu tamamladıkça yeni rozetler açılır.`
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORY_ORDER.map((category) => {
            const list = grouped.get(category) || [];
            if (!list.length) return null;
            return (
              <div key={category}>
                <p className="label-eyebrow mb-3">{CATEGORY_LABELS[category]}</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((a) => {
                    const Icon = ICONS[a.icon];
                    return (
                      <div
                        key={a.id}
                        className={`glass-panel p-5 transition-all ${
                          a.unlocked ? "" : "opacity-60"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                              a.unlocked
                                ? "bg-violet-500/20 text-violet-300"
                                : "bg-ink-800/60 text-mist-700"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {a.unlocked ? (
                            <CheckCircle2 className="h-4 w-4 text-good" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-mist-700" />
                          )}
                        </div>
                        <p className="font-display text-sm font-semibold text-mist-100">
                          {a.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-mist-500">
                          {a.description}
                        </p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/80">
                          <div
                            className={`h-full rounded-full ${
                              a.unlocked ? "bg-violet-400" : "bg-mist-700/50"
                            }`}
                            style={{ width: `${Math.round(a.progress * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-mist-700">{a.progressText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
