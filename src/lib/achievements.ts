import type { Exam, StudyEntry, Topic } from "./db";
import { calculateStreak } from "./streak";

export type AchievementCategory = "study" | "exam" | "topic" | "streak";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: "Clock" | "Award" | "ListChecks" | "Flame";
  category: AchievementCategory;
  unlocked: boolean;
  progress: number; // 0..1
  progressText: string;
};

export type AchievementInput = {
  studyEntries: StudyEntry[];
  exams: Exam[];
  topics: Topic[];
};

const STUDY_HOUR_MILESTONES = [10, 25, 50, 100, 200, 500];
const EXAM_MILESTONES = [1, 5, 10, 25, 50];
const TOPIC_MILESTONES = [10, 25, 50, 100];
const STREAK_MILESTONES = [3, 7, 14, 30, 60];

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function computeAchievements({ studyEntries, exams, topics }: AchievementInput): Achievement[] {
  const totalHours = round1(studyEntries.reduce((sum, e) => sum + (e.hours || 0), 0));
  const examCount = exams.length;
  const topicsDone = topics.filter((t) => t.status === "Tamamlandı").length;
  const streak = calculateStreak(studyEntries);

  const list: Achievement[] = [];

  for (const m of STUDY_HOUR_MILESTONES) {
    list.push({
      id: `study-${m}`,
      title: `${m} Saat Çalıştın`,
      description: `Toplamda ${m} saat çalışma kaydettin.`,
      icon: "Clock",
      category: "study",
      unlocked: totalHours >= m,
      progress: Math.min(1, totalHours / m),
      progressText: `${totalHours}/${m} sa`,
    });
  }

  for (const m of EXAM_MILESTONES) {
    list.push({
      id: `exam-${m}`,
      title: m === 1 ? "İlk Deneme Tamamlandı" : `${m} Deneme Tamamlandı`,
      description:
        m === 1 ? "İlk denemeni sisteme ekledin." : `${m} deneme sonucu kaydettin.`,
      icon: "Award",
      category: "exam",
      unlocked: examCount >= m,
      progress: Math.min(1, examCount / m),
      progressText: `${examCount}/${m}`,
    });
  }

  for (const m of TOPIC_MILESTONES) {
    list.push({
      id: `topic-${m}`,
      title: `${m} Konu Tamamlandı`,
      description: `${m} konuyu "Tamamlandı" olarak işaretledin.`,
      icon: "ListChecks",
      category: "topic",
      unlocked: topicsDone >= m,
      progress: Math.min(1, topicsDone / m),
      progressText: `${topicsDone}/${m}`,
    });
  }

  for (const m of STREAK_MILESTONES) {
    list.push({
      id: `streak-${m}`,
      title: `${m} Gün Seri`,
      description: `Üst üste ${m} gün çalışma kaydettin.`,
      icon: "Flame",
      category: "streak",
      unlocked: streak >= m,
      progress: Math.min(1, streak / m),
      progressText: `${streak}/${m} gün`,
    });
  }

  return list;
}
