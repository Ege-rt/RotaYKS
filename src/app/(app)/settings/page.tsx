"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Save, CheckCircle2, Clapperboard, Palette, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ACCENTS, useAccent } from "@/lib/use-accent";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function SettingsPage() {
  const [tytDate, setTytDate] = useState("");
  const [aytDate, setAytDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { accent, setAccent, mounted: accentMounted } = useAccent();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setTytDate(toLocalInput(d.tytDate));
        setAytDate(toLocalInput(d.aytDate));
        setLoading(false);
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tytDate, aytDate }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Ayarlar"
        title="Sınav tarihleri ve entegrasyonlar"
        description="Geri sayımda kullanılan TYT/AYT tarihlerini ve playlist içe aktarma için gereken YouTube API anahtarı bilgisini buradan yönet."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="mb-1 flex items-center gap-2">
            <Palette className="h-4 w-4 text-violet-300" />
            <p className="font-display text-base font-semibold text-white">Renk Teması</p>
          </div>
          <p className="mt-1 text-xs text-mist-500">
            Sitenin geneline uygulanacak vurgu rengini seç, tüm sayfalarda otomatik olarak
            uyumlu şekilde değişir.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {ACCENTS.map((option) => {
              const active = accentMounted && accent === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAccent(option.id)}
                  aria-label={option.label}
                  aria-pressed={active}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 ring-offset-ink-800 transition-all ${
                      active ? "ring-2 ring-white/70" : "ring-1 ring-line hover:ring-white/30"
                    }`}
                    style={{ backgroundColor: option.swatch }}
                  >
                    {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </span>
                  <span className="text-[11px] text-mist-500">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="font-display text-base font-semibold text-white">Sınav Tarihleri</p>
          <p className="mt-1 text-xs text-mist-500">
            ÖSYM resmi tarihi açıkladığında burayı güncelle, tüm geri sayımlar otomatik yenilenir.
          </p>

          {loading ? (
            <div className="mt-6 h-40 animate-pulse rounded-2xl bg-ink-800/60" />
          ) : (
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">
                  TYT Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  value={tytDate}
                  onChange={(e) => setTytDate(e.target.value)}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">
                  AYT Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  value={aytDate}
                  onChange={(e) => setAytDate(e.target.value)}
                  className="glass-input"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary mt-2 w-fit">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? "Kaydedildi" : "Kaydet"}
              </button>
            </form>
          )}
        </div>

        <div className="glass-panel p-6">
          <div className="mb-1 flex items-center gap-2">
            <Clapperboard className="h-4 w-4 text-violet-300" />
            <p className="font-display text-base font-semibold text-white">
              YouTube Playlist İçe Aktarma
            </p>
          </div>
          <p className="mt-1 text-xs text-mist-500">
            Ders Playlist sayfasında bir YouTube playlist linki yapıştırıp tüm bölümleri
            kapak fotoğraflarıyla otomatik eklemek için ücretsiz bir YouTube Data API v3
            anahtarı gerekir.
          </p>
          <p className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-[12px] text-violet-200">
            Bu kurulum sitenin tamamı için <strong>tek seferlik</strong> yapılır — siteyi
            kuran kişi bir kere anahtarı sunucuya ekler, kayıt olan diğer herkes hiçbir
            şey yapmadan bu özelliği kullanabilir.
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-[13px] text-mist-300">
            <li>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
              >
                Google Cloud Console
              </a>{" "}
              üzerinden bir proje oluştur.
            </li>
            <li>&quot;YouTube Data API v3&quot;ü etkinleştir.</li>
            <li>Credentials sekmesinden bir API anahtarı oluştur.</li>
            <li>
              Proje köküne{" "}
              <code className="rounded bg-[var(--hover-tint)] px-1.5 py-0.5 text-violet-200">.env.local</code>{" "}
              dosyanda{" "}
              <code className="rounded bg-[var(--hover-tint)] px-1.5 py-0.5 text-violet-200">
                YOUTUBE_API_KEY
              </code>{" "}
              değerine anahtarı yapıştır.
            </li>
            <li>Sunucuyu yeniden başlat.</li>
          </ol>
          <p className="mt-4 rounded-2xl border border-line bg-ink-900/50 px-4 py-3 text-[12px] text-mist-500">
            Anahtar tanımlı değilse içe aktarma butonu sana bu adımları hatırlatan bir mesaj gösterir —
            elle playlist/video eklemeye devam edebilirsin.
          </p>
        </div>
      </div>
    </div>
  );
}
