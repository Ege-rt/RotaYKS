"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Bir şeyler ters gitti.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="30 saniyede kur, hemen takibe başla."
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-violet-300 hover:text-violet-200">
            Giriş yap
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist-500">Ad Soyad</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input"
            placeholder="Adın Soyadın"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist-500">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input"
            placeholder="ornek@mail.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-mist-500">Şifre</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
            placeholder="En az 6 karakter"
          />
        </div>
        {error && <p className="text-xs text-bad">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Hesap Oluştur
        </button>
      </form>
    </AuthShell>
  );
}
