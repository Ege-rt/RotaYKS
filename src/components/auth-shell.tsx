import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Logo size={32} glow />
          <span className="font-display text-lg font-semibold tracking-tight text-white">Rota</span>
        </Link>

        <div className="glass-panel p-8">
          <h1 className="font-display text-xl font-semibold text-white">{title}</h1>
          <p className="mt-1.5 text-[13.5px] text-mist-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-[13px] text-mist-700">{footer}</p>
      </div>
    </main>
  );
}
