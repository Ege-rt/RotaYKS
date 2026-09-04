import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { CountdownBar } from "@/components/countdown-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = session.user.name || "Kullanıcı";
  const email = session.user.email || "";

  return (
    <div className="relative min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-noise" />
      <Sidebar name={name} email={email} />
      <MobileNav />
      <div className="relative z-10 lg:pl-64">
        <CountdownBar />
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
