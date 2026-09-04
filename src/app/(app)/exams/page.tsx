"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Plus, Trash2, Loader2, CalendarDays, Info } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TYT_RULES, AYT_TRACKS, AYT_TRACK_OPTIONS, AytTrackKey } from "@/lib/exam-rules";
import { PUBLISHERS } from "@/lib/publishers";
import type { Exam } from "@/lib/db";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<"TYT" | "AYT">("TYT");
  const [track, setTrack] = useState<AytTrackKey>("sayisal");
  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [nets, setNets] = useState<Record<string, string>>({});

  const rules = type === "TYT" ? TYT_RULES : AYT_TRACKS[track];
  const activeSubjects = Object.keys(rules.subjects);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => {
        setExams(d.exams || []);
        setLoading(false);
      });
  }, []);

  const total = useMemo(
    () =>
      Math.round(
        activeSubjects.reduce((sum, s) => sum + (parseFloat(nets[s]) || 0), 0) * 100
      ) / 100,
    [nets, activeSubjects]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const subjectNets: Record<string, number> = {};
    activeSubjects.forEach((s) => {
      const v = parseFloat(nets[s]);
      if (Number.isFinite(v)) subjectNets[s] = v;
    });

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        track: type === "AYT" ? track : undefined,
        publisher,
        date,
        subjectNets,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setExams((prev) => [...prev, data.exam].sort((a, b) => (a.date > b.date ? 1 : -1)));
      setName("");
      setPublisher("");
      setNets({});
    }
  }

  async function deleteExam(id: string) {
    setExams((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
  }

  const sorted = [...exams].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Deneme Analizi"
        title="Yayınevi, tarih ve net gir"
        description="Toplam net otomatik hesaplanır. Ders soru sayıları gerçek ÖSYM oturum yapısına göre gösterilir."
      />

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Form */}
        <div className="glass-panel h-fit p-6">
          <div className="mb-4 flex rounded-2xl border border-line bg-ink-900/60 p-1">
            {(["TYT", "AYT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setNets({});
                }}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                  type === t ? "bg-violet-500/25 text-white" : "text-mist-500 hover:text-mist-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {type === "AYT" && (
            <div className="mb-4 grid grid-cols-2 gap-1.5">
              {AYT_TRACK_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setTrack(opt.key);
                    setNets({});
                  }}
                  className={`rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
                    track === opt.key
                      ? "bg-violet-500/20 text-white border border-violet-400/30"
                      : "border border-line text-mist-500 hover:text-mist-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="mb-4 flex items-center gap-2 rounded-xl bg-violet-500/10 px-3.5 py-2 text-[11px] text-violet-200">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {rules.totalQuestions} soru · {rules.durationMinutes} dakika
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Deneme Adı</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                placeholder="Örn: 345 TYT Denemesi"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">Yayınevi</label>
                <input
                  list="publisher-list"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="glass-input"
                  placeholder="Yazmaya başla..."
                />
                <datalist id="publisher-list">
                  {PUBLISHERS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-ink-900/40 p-4">
              <p className="mb-3 text-xs font-medium text-mist-500">Ders Netleri</p>
              <div className="grid grid-cols-2 gap-3">
                {activeSubjects.map((s) => (
                  <div key={s}>
                    <label className="mb-1 flex items-center justify-between text-[11px] text-mist-700">
                      <span>{s}</span>
                      <span className="text-mist-700/70">{rules.subjects[s]} soru</span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min={0}
                      max={rules.subjects[s]}
                      value={nets[s] ?? ""}
                      onChange={(e) => setNets((p) => ({ ...p, [s]: e.target.value }))}
                      className="glass-input !py-1.5 text-sm"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-violet-500/10 px-4 py-3">
              <span className="text-xs font-medium text-mist-300">Toplam Net</span>
              <span className="stat-number text-xl text-white">
                {total} <span className="text-xs text-mist-500">/ {rules.totalQuestions}</span>
              </span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Denemeyi Kaydet
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="glass-panel overflow-hidden p-0">
          <div className="border-b border-line px-6 py-4">
            <p className="font-display text-base font-semibold text-white">
              Tüm Denemeler ({exams.length})
            </p>
          </div>
          {loading ? (
            <div className="p-6">
              <div className="h-48 animate-pulse rounded-2xl bg-ink-800/60" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <CalendarDays className="h-8 w-8 text-mist-700" />
              <p className="text-sm text-mist-500">Henüz deneme eklenmedi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-mist-700">
                    <th className="px-6 py-3 font-medium">Deneme</th>
                    <th className="px-3 py-3 font-medium">Tür</th>
                    <th className="px-3 py-3 font-medium">Yayınevi</th>
                    <th className="px-3 py-3 font-medium">Tarih</th>
                    <th className="px-3 py-3 font-medium">Toplam Net</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((exam) => (
                    <tr key={exam.id} className="border-t border-line/60 hover:bg-[var(--hover-tint)]">
                      <td className="px-6 py-3.5 font-medium text-mist-100">{exam.name}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            exam.type === "TYT"
                              ? "bg-violet-500/20 text-violet-200"
                              : "bg-good/15 text-good"
                          }`}
                        >
                          {exam.type}
                          {exam.track ? ` · ${AYT_TRACKS[exam.track as AytTrackKey]?.label ?? ""}` : ""}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-mist-500">{exam.publisher || "—"}</td>
                      <td className="px-3 py-3.5 text-mist-500">
                        {new Date(exam.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-3 py-3.5 stat-number font-semibold text-white">
                        {exam.totalNet}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <button
                          onClick={() => deleteExam(exam.id)}
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
          )}
        </div>
      </div>
    </div>
  );
}
