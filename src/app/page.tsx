import Link from "next/link";
import {
  ArrowUpRight,
  ListChecks,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

const pillars = [
  {
    icon: PlayCircle,
    title: "Playlist Takibi",
    desc: "YouTube ders playlist'lerini bölüm bölüm işaretle, nerede kaldığını asla kaybetme.",
  },
  {
    icon: ListChecks,
    title: "TYT / AYT Konu Takibi",
    desc: "Her ders için konu anlatımı ve test durumunu ayrı ayrı işaretle, ilerlemeni gör.",
  },
  {
    icon: TrendingUp,
    title: "Deneme Net Analizi",
    desc: "Yayınevi, tarih ve ders netlerini gir; toplam net otomatik hesaplansın, artış eğrini izle.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <div className="flex items-center gap-2.5">
          <Logo size={32} glow />
          <span className="font-display text-lg font-semibold tracking-tight text-white">Rota</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <Link href="/login" className="btn-ghost text-mist-300">
            Giriş Yap
          </Link>
          <Link href="/register" className="btn-primary !py-2 !px-4 text-[13px]">
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="mx-auto mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-ink-800/60 px-3.5 py-1.5 text-xs text-mist-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          2026 YKS için hazırlandı
        </div>
        <h1
          className="mx-auto max-w-3xl animate-fade-up font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Sınava giden yolu
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-violet-200 to-white bg-clip-text text-transparent">
            tek panelde
          </span>{" "}
          topla.
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl animate-fade-up text-[15px] leading-relaxed text-mist-500"
          style={{ animationDelay: "160ms" }}
        >
          Ders videoların, konu takibin ve deneme netlerin dağınık notlar arasında kaybolmasın.
          Rota, YKS hazırlığını ölçülebilir ve sade bir sisteme dönüştürür.
        </p>
        <div
          className="mt-9 flex animate-fade-up items-center justify-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/register" className="btn-primary">
            Hesap Oluştur <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-secondary">
            Zaten hesabım var
          </Link>
        </div>

        {/* Preview mock */}
        <div
          className="relative mx-auto mt-20 max-w-4xl animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          <div className="glass-panel animate-float overflow-hidden p-1.5">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-violet-300/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-good/60" />
              <span className="ml-3 text-[11px] text-mist-700">rota.app/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 text-left">
              <div className="col-span-2 rounded-xl border border-line bg-ink-900/60 p-5">
                <p className="label-eyebrow">Net Grafiği</p>
                <p className="mt-1 stat-number text-3xl text-white">117.0</p>
                <div className="mt-4 flex h-24 items-end gap-1.5">
                  {[40, 52, 48, 63, 70, 65, 80, 76, 92, 85, 100, 117].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-600/60 to-violet-300/80"
                      style={{ height: `${(v / 117) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-line bg-ink-900/60 p-4">
                  <p className="label-eyebrow">Konu İlerlemesi</p>
                  <p className="mt-1 stat-number text-2xl text-white">%68</p>
                </div>
                <div className="rounded-xl border border-line bg-ink-900/60 p-4">
                  <p className="label-eyebrow">İzlenen Video</p>
                  <p className="mt-1 stat-number text-2xl text-white">142</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="label-eyebrow">Nasıl Çalışır</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">
            Üç panel, tek disiplin.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="glass-panel p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mist-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security note */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="glass-panel flex flex-col items-center gap-3 p-8">
          <ShieldCheck className="h-6 w-6 text-violet-300" />
          <p className="text-sm text-mist-300">
            Verilerin hesabına özel olarak saklanır; şifreler geri döndürülemez şekilde şifrelenir.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-line py-8 text-center text-xs text-mist-700">
        Rota — YKS için kişisel takip sistemi.
      </footer>
    </main>
  );
}
