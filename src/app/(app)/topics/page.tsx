"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TYT_SUBJECTS, AYT_SUBJECTS } from "@/lib/topics-seed";
import type { Topic } from "@/lib/db";

const STATUS_OPTIONS: Topic["status"][] = ["Başlanmadı", "Devam Ediyor", "Tamamlandı"];

const STATUS_STYLES: Record<Topic["status"], string> = {
  "Başlanmadı": "bg-[var(--hover-tint)] text-mist-500",
  "Devam Ediyor": "bg-violet-500/20 text-violet-200",
  "Tamamlandı": "bg-good/15 text-good",
};

export default function TopicsPage() {
  const [examType, setExamType] = useState<"TYT" | "AYT">("TYT");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>(TYT_SUBJECTS[0]);
  const [newTopic, setNewTopic] = useState("");
  const [adding, setAdding] = useState(false);

  const subjects = examType === "TYT" ? TYT_SUBJECTS : AYT_SUBJECTS;

  useEffect(() => {
    setSubject(subjects[0]);
  }, [examType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetch(`/api/topics?examType=${examType}`)
      .then((r) => r.json())
      .then((d) => {
        setTopics(d.topics || []);
        setLoading(false);
      });
  }, [examType]);

  const filtered = useMemo(
    () => topics.filter((t) => t.subject === subject).sort((a, b) => a.order - b.order),
    [topics, subject]
  );

  const subjectProgress = useMemo(() => {
    const map: Record<string, { done: number; total: number }> = {};
    subjects.forEach((s) => {
      const list = topics.filter((t) => t.subject === s);
      map[s] = { done: list.filter((t) => t.status === "Tamamlandı").length, total: list.length };
    });
    return map;
  }, [topics, subjects]);

  async function patchTopic(id: string, body: Partial<Topic>) {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...body } : t)));
    await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function toggleField(t: Topic, field: "explanation" | "test") {
    const updated = { [field]: !t[field] } as Partial<Topic>;
    // auto status logic
    const nextExplanation = field === "explanation" ? !t.explanation : t.explanation;
    const nextTest = field === "test" ? !t.test : t.test;
    if (nextExplanation && nextTest) updated.status = "Tamamlandı";
    else if (nextExplanation || nextTest) updated.status = "Devam Ediyor";
    else updated.status = "Başlanmadı";
    patchTopic(t.id, updated);
  }

  async function addTopic(e: FormEvent) {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setAdding(true);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examType, subject, topic: newTopic }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok) {
      setTopics((prev) => [...prev, data.topic]);
      setNewTopic("");
    }
  }

  async function deleteTopic(id: string) {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/topics/${id}`, { method: "DELETE" });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Konu Takibi"
        title="TYT & AYT müfredatı"
        description="Konu anlatımı ve test durumunu işaretle, ilerlemeni ders bazında izle."
      />

      <div className="mb-6 flex w-fit rounded-xl border border-line bg-ink-900/60 p-1">
        {(["TYT", "AYT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setExamType(t)}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors ${
              examType === t ? "bg-violet-500/25 text-white" : "text-mist-500 hover:text-mist-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Subject list */}
        <div className="glass-panel h-fit p-2">
          {subjects.map((s) => {
            const prog = subjectProgress[s] || { done: 0, total: 0 };
            const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
            return (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ${
                  subject === s ? "bg-violet-500/15 text-white" : "text-mist-500 hover:bg-[var(--hover-tint)] hover:text-mist-100"
                }`}
              >
                <span>{s}</span>
                <span className="stat-number text-[11px] text-mist-700">{pct}%</span>
              </button>
            );
          })}
        </div>

        {/* Topic table */}
        <div className="glass-panel overflow-hidden p-0">
          <div className="border-b border-line px-6 py-4">
            <p className="font-display text-base font-semibold text-white">{subject}</p>
            <p className="text-xs text-mist-700">
              {examType} · {filtered.length} konu
            </p>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="h-64 animate-pulse rounded-xl bg-ink-800/60" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-mist-700">
                      <th className="px-6 py-3 font-medium">Konu</th>
                      <th className="w-28 px-3 py-3 text-center font-medium">Anlatım</th>
                      <th className="w-24 px-3 py-3 text-center font-medium">Test</th>
                      <th className="w-36 px-3 py-3 font-medium">Durum</th>
                      <th className="w-10 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-t border-line/60 hover:bg-[var(--hover-tint)]">
                        <td className="px-6 py-3 text-mist-100">{t.topic}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleField(t, "explanation")}
                            className={`mx-auto flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                              t.explanation
                                ? "border-violet-400 bg-violet-500"
                                : "border-line bg-transparent hover:border-violet-400/50"
                            }`}
                          >
                            {t.explanation && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleField(t, "test")}
                            className={`mx-auto flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                              t.test
                                ? "border-violet-400 bg-violet-500"
                                : "border-line bg-transparent hover:border-violet-400/50"
                            }`}
                          >
                            {t.test && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={t.status}
                            onChange={(e) =>
                              patchTopic(t.id, { status: e.target.value as Topic["status"] })
                            }
                            className={`rounded-md border-0 px-2 py-1 text-[11px] font-medium outline-none ${STATUS_STYLES[t.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-ink-900 text-mist-100">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => deleteTopic(t.id)}
                            className="rounded-lg p-1.5 text-mist-700 hover:bg-bad/10 hover:text-bad"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={addTopic} className="flex gap-2 border-t border-line p-4">
                <input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder={`${subject} için yeni konu ekle...`}
                  className="glass-input flex-1"
                />
                <button type="submit" disabled={adding} className="btn-secondary">
                  <Plus className="h-4 w-4" /> Ekle
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
