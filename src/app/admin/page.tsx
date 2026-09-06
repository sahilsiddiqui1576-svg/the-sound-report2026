"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COLLECTIONS, COLLECTION_SLUGS } from "@/lib/types";

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [importing, setImporting] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { (async () => { const s=createClient(); const {data}=await s.from("content_entries").select("collection"); const c:Record<string,number>={}; data?.forEach(r=>c[r.collection]=(c[r.collection]||0)+1); setCounts(c); })(); }, []);
  async function logout(){ await createClient().auth.signOut(); location.href="/admin/login"; }
  async function importContent(){ setImporting(true); setMessage(""); const r=await fetch("/api/admin/import",{method:"POST"}); const d=await r.json(); setMessage(r.ok?`Imported ${d.imported} existing items.`:(d.error||"Import failed")); setImporting(false); }
  async function replaceWithCurrent(){ if(!confirm("This will remove the current database content and replace it with the 2026 content bundled with this website. Continue?")) return; setReplacing(true); setMessage(""); const r=await fetch("/api/admin/import?replace=true",{method:"POST"}); const d=await r.json(); setMessage(r.ok?`Replaced database with ${d.imported} current items.`:(d.error||"Replace failed")); setReplacing(false); }
  return <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0c]
  "><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">The Sound Report</p><h1 className="mt-1 font-display text-3xl font-black">Admin Dashboard</h1></div><div className="flex flex-wrap gap-2"><button onClick={replaceWithCurrent} disabled={replacing} className="rounded-full border border-accent/40 px-4 py-2 text-sm disabled:opacity-50">{replacing?"Replacing…":"Load 2026 content"}</button><button onClick={importContent} disabled={importing} className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/10">{importing?"Importing…":"Import existing content"}</button><button onClick={logout} className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10">Sign out</button></div></div>
  <p className="mt-4 text-sm text-neutral-500">{message}</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{COLLECTION_SLUGS.map(slug=><Link key={slug} href={`/admin/${slug}`} className="rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[.04]"><div className="flex items-center justify-between"><span className="font-display font-bold">{COLLECTIONS[slug].label}</span><span className="rounded-full bg-black/[.05] px-2.5 py-1 text-xs dark:bg-white/10">{counts[slug]||0}</span></div><p className="mt-2 text-sm text-neutral-500">Add, edit, publish or remove.</p></Link>)}</div>
  <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[.04]"><h2 className="font-display font-bold">First-time setup</h2><p className="mt-2 text-sm text-neutral-500">Use “Load 2026 content” once to replace the placeholder database content with the current editorial package. After that, manage everything from the dashboard.</p></div>
  </div></main>;
}
