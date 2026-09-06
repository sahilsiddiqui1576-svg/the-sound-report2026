"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/admin");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5 dark:bg-[#0a0a0c]">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[.04]">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">The Sound Report</p>
      <h1 className="mt-2 font-display text-3xl font-black">Admin Login</h1>
      <p className="mt-2 text-sm text-neutral-500">Private editorial dashboard</p>
      <label className="mt-7 block text-sm font-semibold">Email<input className="admin-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="mt-4 block text-sm font-semibold">Password<input className="admin-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black">{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  </main>;
}
