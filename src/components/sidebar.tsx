"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ListChecks,
  PlayCircle,
  TrendingUp,
  Clock,
  Compass,
  Timer,
  Settings,
  LogOut,
  Quote,
  Trophy,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

const links = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/exams", label: "Deneme Analizi", icon: TrendingUp },
  { href: "/topics", label: "Konu Takibi", icon: ListChecks },
  { href: "/study", label: "Çalışma Takibi", icon: Clock },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/videos", label: "Ders Playlist", icon: PlayCircle },
  { href: "/achievements", label: "Rozetler", icon: Trophy },
  { href: "/tercih", label: "Tercih Sihirbazı", icon: Compass },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-ink-900/70 backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Logo size={32} glow />
          <span className="font-display text-lg font-semibold tracking-tight text-white">Rota</span>
        </div>
        <ThemeToggle compact />
      </div>

      <nav className="flex-1 space-y-1 px-3.5 py-2">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${active ? "nav-link-active" : ""}`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative mx-3.5 mb-4 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-4">
        <Quote className="mb-1.5 h-3.5 w-3.5 text-violet-300/80" strokeWidth={2.5} />
        <p className="text-[12.5px] font-medium leading-relaxed text-mist-100">
          &quot;Başarının bedelini bir dönem için ödemeyenler, başaramamanın bedelini bir ömür
          boyu öderler.&quot;
        </p>
      </div>

      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-ink-800/60 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-800 text-xs font-semibold text-white">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-mist-100">{name}</p>
            <p className="truncate text-[11px] text-mist-700">{email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-link w-full text-mist-500 hover:text-bad"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
