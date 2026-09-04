"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Play, Pause, RotateCcw, Settings2, Flame, CheckCircle2, BellRing, BellOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import type { StudyEntry } from "@/lib/db";

type Mode = "work" | "short" | "long";

const MODE_LABELS: Record<Mode, string> = {
  work: "Odaklanma",
  short: "Kısa Mola",
  long: "Uzun Mola",
};

const DEFAULTS = { work: 25, short: 5, long: 15 };
const CYCLES_BEFORE_LONG_BREAK = 4;
const STORAGE_KEY = "rota-pomodoro-settings";
const COUNT_KEY_PREFIX = "rota-pomodoro-count-";

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    // Three short chimes, each a touch higher — more noticeable than a
    // single beep, especially if the tab isn't focused.
    const notes = [880, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => ctx.close().catch(() => {}), (notes.length * 0.22 + 0.6) * 1000);
  } catch {
    // Web Audio unavailable — silently skip the beep.
  }
}

function notifyPhaseEnd(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "rota-pomodoro",
      requireInteraction: false,
    } as NotificationOptions);
    n.onclick = () => {
      window.focus();
      n.close();
    };
    if ("vibrate" in navigator) {
      navigator.vibrate?.([120, 60, 120]);
    }
  } catch {
    // Notification constructor can throw on some platforms (e.g. iOS Safari
    // outside an installed PWA) — the beep above still covers those cases.
  }
}

export default function PomodoroPage() {
  const [durations, setDurations] = useState(DEFAULTS);
  const [showSettings, setShowSettings] = useState(false);

  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work * 60);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );

  const todayKey = format(new Date(), "yyyy-MM-dd");

  // Load persisted settings + today's completed count + study entries once.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDurations(parsed);
        setSecondsLeft(parsed.work * 60);
      }
      const count = localStorage.getItem(COUNT_KEY_PREFIX + todayKey);
      if (count) setCompletedToday(parseInt(count, 10) || 0);
    } catch {
      // localStorage unavailable — fall back to in-memory defaults.
    }

    fetch("/api/study")
      .then((r) => r.json())
      .then((d) => {
        setStudyEntries(d.entries || []);
        setLoaded(true);
      });

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function requestNotifPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then((perm) => setNotifPermission(perm));
  }

  const totalSeconds = durations[mode] * 60;

  const logFocusMinutes = useCallback(
    async (minutes: number) => {
      const existing = studyEntries.find((e) => e.date === todayKey);
      const newHours = Math.round(((existing?.hours || 0) + minutes / 60) * 100) / 100;
      setStudyEntries((prev) => {
        const rest = prev.filter((e) => e.date !== todayKey);
        return [...rest, { id: todayKey, userId: "", date: todayKey, hours: newHours }];
      });
      await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayKey, hours: newHours }),
      });
    },
    [studyEntries, todayKey]
  );

  const advancePhase = useCallback(() => {
    playBeep();
    notifyPhaseEnd(
      mode === "work" ? "Süre doldu — mola zamanı!" : "Mola bitti — odaklanma zamanı!",
      mode === "work"
        ? `${durations.work} dakikalık odaklanma tamamlandı. Şimdi mola ver.`
        : "Mola bitti, yeni bir odaklanma turuna başlayabilirsin."
    );

    if (mode === "work") {
      logFocusMinutes(durations.work);
      const nextCount = completedToday + 1;
      setCompletedToday(nextCount);
      try {
        localStorage.setItem(COUNT_KEY_PREFIX + todayKey, String(nextCount));
      } catch {
        // ignore
      }
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      const nextMode: Mode = newCycle % CYCLES_BEFORE_LONG_BREAK === 0 ? "long" : "short";
      setMode(nextMode);
      setSecondsLeft(durations[nextMode] * 60);
    } else {
      setMode("work");
      setSecondsLeft(durations.work * 60);
    }
    setRunning(false);
  }, [mode, durations, completedToday, cycleCount, logFocusMinutes, todayKey]);

  // Countdown ticker
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          advancePhase();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, advancePhase]);

  // Tab title reflects the countdown so it's visible even unfocused.
  useEffect(() => {
    if (running) {
      const m = Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, "0");
      const s = (secondsLeft % 60).toString().padStart(2, "0");
      document.title = `${m}:${s} · ${MODE_LABELS[mode]} — Rota`;
    } else {
      document.title = "Rota — YKS Takip Sistemi";
    }
    return () => {
      document.title = "Rota — YKS Takip Sistemi";
    };
  }, [running, secondsLeft, mode]);

  function toggleRunning() {
    if (!running && typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
        .then((perm) => setNotifPermission(perm))
        .catch(() => {});
    }
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(durations[mode] * 60);
  }

  function switchMode(next: Mode) {
    setRunning(false);
    setMode(next);
    setSecondsLeft(durations[next] * 60);
  }

  function saveDurations(next: typeof DEFAULTS) {
    setDurations(next);
    setRunning(false);
    setSecondsLeft(next[mode] * 60);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = totalSeconds ? 1 - secondsLeft / totalSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const todayFocusHours = loaded
    ? studyEntries.find((e) => e.date === todayKey)?.hours || 0
    : 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Odaklanma"
        title="Pomodoro Sayacı"
        description="25 dakika odaklan, 5 dakika mola ver. Tamamladığın her odaklanma süresi otomatik olarak çalışma takibine eklenir."
        action={
          <button onClick={() => setShowSettings((s) => !s)} className="btn-secondary">
            <Settings2 className="h-4 w-4" /> Süreleri Ayarla
          </button>
        }
      />

      {showSettings && (
        <div className="glass-panel mb-6 grid grid-cols-3 gap-4 p-5">
          {(["work", "short", "long"] as Mode[]).map((m) => (
            <div key={m}>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">
                {MODE_LABELS[m]} (dk)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={durations[m]}
                onChange={(e) =>
                  saveDurations({ ...durations, [m]: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="glass-input"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="glass-panel flex flex-col items-center p-8 sm:p-12">
          <div className="mb-6 flex gap-1.5 rounded-2xl border border-line bg-ink-900/50 p-1">
            {(["work", "short", "long"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                  mode === m
                    ? "bg-violet-500/25 text-white border border-violet-400/30"
                    : "text-mist-500 hover:text-mist-100"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          <div className="relative flex h-[280px] w-[280px] items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke="var(--line-color)"
                strokeWidth="10"
              />
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke={mode === "work" ? "#9B72FF" : "#3DDC9A"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="text-center">
              <p className="stat-number font-display text-6xl font-semibold text-mist-100">
                {minutes}:{seconds}
              </p>
              <p className="mt-1 text-xs text-mist-500">{MODE_LABELS[mode]}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button onClick={reset} className="btn-secondary !px-4">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={toggleRunning} className="btn-primary !px-8">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Duraklat" : "Başlat"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="label-eyebrow">Bugün</p>
              <Flame className="h-4 w-4 text-violet-300" />
            </div>
            <p className="stat-number text-3xl text-mist-100">{completedToday}</p>
            <p className="mt-1 text-xs text-mist-500">tamamlanan pomodoro</p>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="label-eyebrow">Bugün Çalışma</p>
              <CheckCircle2 className="h-4 w-4 text-violet-300" />
            </div>
            <p className="stat-number text-3xl text-mist-100">{todayFocusHours} sa</p>
            <p className="mt-1 text-xs text-mist-500">
              Çalışma Takibi sayfasına otomatik işlenir.
            </p>
          </div>

          {notifPermission === "default" && (
            <div className="glass-panel p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="label-eyebrow">Bildirimler</p>
                <BellRing className="h-4 w-4 text-violet-300" />
              </div>
              <p className="mb-3 text-[12.5px] leading-relaxed text-mist-500">
                Süre dolduğunda başka bir sekmedeysen bile haberdar olmak için
                tarayıcı bildirimlerine izin ver.
              </p>
              <button onClick={requestNotifPermission} className="btn-secondary w-full !py-2 text-xs">
                Bildirimleri Etkinleştir
              </button>
            </div>
          )}
          {notifPermission === "denied" && (
            <div className="glass-panel p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="label-eyebrow">Bildirimler</p>
                <BellOff className="h-4 w-4 text-mist-700" />
              </div>
              <p className="text-[12.5px] leading-relaxed text-mist-500">
                Bildirimler tarayıcı ayarlarından engellenmiş. Yine de süre
                dolduğunda sesli uyarı çalar.
              </p>
            </div>
          )}

          <div className="glass-panel p-5">
            <p className="label-eyebrow mb-2">Nasıl Çalışır</p>
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-mist-500">
              <li>• {durations.work} dk odaklan, ardından {durations.short} dk mola ver.</li>
              <li>• Her {CYCLES_BEFORE_LONG_BREAK} odaklanmada bir {durations.long} dk uzun mola gelir.</li>
              <li>• Tamamlanan odaklanma süresi otomatik çalışma saatine eklenir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
