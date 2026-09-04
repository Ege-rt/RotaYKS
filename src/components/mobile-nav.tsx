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
  Trophy,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

const links = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/exams", label: "Denemeler", icon: TrendingUp },
  { href: "/topics", label: "Konular", icon: ListChecks },
  { href: "/study", label: "Çalışma", icon: Clock },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/videos", label: "Playlist", icon: PlayCircle },
  { href: "/achievements", label: "Rozetler", icon: Trophy },
  { href: "/tercih", label: "Tercih", icon: Compass },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 border-b border-line bg-ink-900/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-display text-base font-semibold text-white">Rota</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex h-8 w-8 items-center justify-center text-mist-500 hover:text-bad"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
        {links.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                active ? "bg-violet-500/20 text-white" : "text-mist-500"
              }`}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
