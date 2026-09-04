"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  Search,
  Compass,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { UniversityThumb } from "@/components/university-thumb";
import { UNIVERSITIES } from "@/lib/universities";
import { DEPARTMENTS } from "@/lib/departments";
import { yokAtlasWizardUrl, yokAtlasSearchUrl, yokAtlasHomeUrl, PuanTuru } from "@/lib/yokatlas";
import type { Preference } from "@/lib/db";

const PUAN_TURU_OPTIONS: { key: PuanTuru; label: string }[] = [
  { key: "sayisal", label: "Sayısal" },
  { key: "ea", label: "Eşit Ağırlık" },
  { key: "sozel", label: "Sözel" },
  { key: "dil", label: "Yabancı Dil" },
];

function AddToListForm({
  defaultUniversity,
  onAdd,
}: {
  defaultUniversity?: string;
  onAdd: (university: string, department: string) => Promise<void>;
}) {
  const [university, setUniversity] = useState(defaultUniversity || "");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!university.trim() || !department.trim()) return;
    setSaving(true);
    await onAdd(university, department);
    setSaving(false);
    setDepartment("");
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
      {!defaultUniversity && (
        <input
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="Üniversite adı"
          className="glass-input"
        />
      )}
      <input
        list="department-list-tercih"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        placeholder="Bölüm adı"
        className="glass-input flex-1"
      />
      <button type="submit" disabled={saving} className="btn-secondary shrink-0">
        <Plus className="h-4 w-4" /> Listeme Ekle
      </button>
    </form>
  );
}

export default function TercihPage() {
  const [puanTuru, setPuanTuru] = useState<PuanTuru>("sayisal");
  const [query, setQuery] = useState("");
  const [openAddFor, setOpenAddFor] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((d) => {
        setPreferences(d.preferences || []);
        setLoading(false);
      });
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!query.trim()) return UNIVERSITIES;
    const q = query.toLocaleLowerCase("tr-TR");
    return UNIVERSITIES.filter((u) => u.name.toLocaleLowerCase("tr-TR").includes(q));
  }, [query]);

  async function addPreference(university: string, department: string) {
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ university, department }),
    });
    const data = await res.json();
    if (res.ok) {
      setPreferences((prev) => [...prev, data.preference]);
      setOpenAddFor(null);
    }
  }

  async function removePreference(id: string) {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/preferences/${id}`, { method: "DELETE" });
  }

  async function updateNote(id: string, note: string) {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, note } : p)));
    await fetch(`/api/preferences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
  }

  async function move(id: string, direction: -1 | 1) {
    const sorted = [...preferences].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const newA = { ...a, order: b.order };
    const newB = { ...b, order: a.order };
    setPreferences((prev) =>
      prev.map((p) => (p.id === a.id ? newA : p.id === b.id ? newB : p))
    );
    await Promise.all([
      fetch(`/api/preferences/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/preferences/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
  }

  const sortedPreferences = [...preferences].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Tercih Sihirbazı"
        title="Üniversite araştırma & tercih listesi"
        description="Taban puan ve sıralama gibi rakamlar her yıl değişir — bu yüzden onları burada uydurmuyoruz. Resmi YÖK Atlas'a yönlendiriyor, senin kendi tercih listeni burada topluyoruz."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Wizard card */}
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-violet-300" />
              <h2 className="font-display text-base font-semibold text-white">
                Resmi Tercih Sihirbazı
              </h2>
            </div>
            <p className="mb-4 text-[13px] text-mist-500">
              Puan türünü seç, YÖK Atlas&apos;ın güncel taban puan/sıralama tablosunu yeni sekmede aç.
            </p>
            <div className="mb-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {PUAN_TURU_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setPuanTuru(opt.key)}
                  className={`rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
                    puanTuru === opt.key
                      ? "bg-violet-500/20 text-white border border-violet-400/30"
                      : "border border-line text-mist-500 hover:text-mist-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <a
              href={yokAtlasWizardUrl(puanTuru)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              YÖK Atlas Tercih Sihirbazını Aç
            </a>
            <a
              href={yokAtlasHomeUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-center text-[12px] text-mist-700 hover:text-violet-300 sm:hidden"
            >
              veya YÖK Atlas ana sayfasını aç
            </a>
          </div>

          {/* University research grid */}
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-white">
                Üniversite Araştırma
              </h2>
              <div className="relative w-40 sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-700" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Üniversite ara..."
                  className="glass-input !py-1.5 pl-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredUniversities.map((u) => (
                <div key={u.slug} className="flex flex-col gap-2">
                  <UniversityThumb slug={u.slug} name={u.name} />
                  <p className="line-clamp-2 text-[12px] leading-snug text-mist-200">{u.name}</p>
                  <div className="flex gap-1.5">
                    <a
                      href={yokAtlasSearchUrl(u.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost flex-1 justify-center border border-line !py-1.5"
                    >
                      <ExternalLink className="h-3 w-3" /> İncele
                    </a>
                    <button
                      onClick={() => setOpenAddFor(openAddFor === u.slug ? null : u.name)}
                      className="btn-ghost flex-1 justify-center border border-line !py-1.5"
                    >
                      <Plus className="h-3 w-3" /> Ekle
                    </button>
                  </div>
                  {openAddFor === u.name && (
                    <AddToListForm defaultUniversity={u.name} onAdd={addPreference} />
                  )}
                </div>
              ))}
            </div>

            {filteredUniversities.length === 0 && (
              <p className="py-8 text-center text-sm text-mist-500">
                Eşleşen üniversite yok — YÖK Atlas&apos;ta tüm üniversiteler için arama yapabilirsin.
              </p>
            )}

            <div className="mt-5 rounded-2xl border border-dashed border-line p-4">
              <p className="mb-2 text-xs font-medium text-mist-500">
                Listede olmayan bir üniversite mi arıyorsun?
              </p>
              <AddToListForm onAdd={addPreference} />
              <datalist id="department-list-tercih">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* My preference list */}
        <div className="glass-panel h-fit p-6">
          <div className="mb-1 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-violet-300" />
            <h2 className="font-display text-base font-semibold text-white">Tercih Listem</h2>
          </div>
          <p className="mb-4 text-[12px] text-mist-500">
            YÖK Atlas&apos;ta bulduğun tercihleri sırayla buraya ekle, notlarını (taban puan,
            sıralama vb.) kendi bulduğun güncel rakamlarla doldur.
          </p>

          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-ink-800/60" />
          ) : sortedPreferences.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-10 text-center">
              <Info className="h-5 w-5 text-mist-700" />
              <p className="text-sm text-mist-500">Henüz tercih eklenmedi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPreferences.map((p, i) => (
                <div key={p.id} className="rounded-2xl border border-line bg-ink-900/40 p-3.5">
                  <div className="flex items-start gap-2">
                    <span className="stat-number mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] text-violet-200">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-mist-100">
                        {p.university}
                      </p>
                      <p className="truncate text-[12px] text-mist-500">{p.department}</p>
                    </div>
                    <div className="flex shrink-0 flex-col">
                      <button
                        onClick={() => move(p.id, -1)}
                        disabled={i === 0}
                        className="text-mist-700 hover:text-violet-300 disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(p.id, 1)}
                        disabled={i === sortedPreferences.length - 1}
                        className="text-mist-700 hover:text-violet-300 disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removePreference(p.id)}
                      className="shrink-0 text-mist-700 hover:text-bad"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    defaultValue={p.note}
                    onBlur={(e) => updateNote(p.id, e.target.value)}
                    placeholder="Not: taban puan, sıralama..."
                    className="glass-input mt-2 !py-1.5 text-[12px]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
