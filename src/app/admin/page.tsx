"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COLLECTIONS } from "@/lib/types";
import { ArrowUpRight, Settings, Upload, LogOut } from "lucide-react";

const EDITORIAL = ["articles", "artist-spotlights", "trend-reports", "playlists"] as const;

export default function AdminDashboard() {
  const [counts,setCounts]=useState<Record<string,number>>({}); const [drafts,setDrafts]=useState(0); const [published,setPublished]=useState(0); const [message,setMessage]=useState("");
  useEffect(()=>{(async()=>{const {data}=await createClient().from("content_entries").select("collection,draft");const next:Record<string,number>={};let d=0,p=0;data?.forEach(r=>{next[r.collection]=(next[r.collection]||0)+1;r.draft?d++:p++;});setCounts(next);setDrafts(d);setPublished(p);})();},[]);
  async function logout(){await createClient().auth.signOut();location.href="/admin/login";}
  async function importContent(){if(!confirm("Load the bundled 2026 content and replace current imported content?"))return;setMessage("Loading bundled editorial content…");const response=await fetch("/api/admin/import?replace=true",{method:"POST"});const data=await response.json();setMessage(response.ok?`Loaded ${data.imported} editorial items.`:(data.error||"Could not load content."));}
  return <main className="min-h-screen bg-[#f4f1ea] dark:bg-[#0a0a0c]"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-7 dark:border-white/10"><div><p className="editorial-kicker">The Sound Report · Private</p><h1 className="mt-2 font-display text-5xl font-black uppercase leading-none tracking-[-.05em] sm:text-6xl">Editorial Desk</h1><p className="mt-3 max-w-xl text-sm text-neutral-500">The working room for stories, artists, trends and playlists.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/settings" className="inline-flex items-center gap-2 border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[.1em] dark:border-white/15"><Settings size={14}/> Settings</Link><button onClick={importContent} className="inline-flex items-center gap-2 border border-accent px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-accent"><Upload size={14}/> Load 2026</button><button onClick={logout} className="inline-flex items-center gap-2 border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[.1em] dark:border-white/15"><LogOut size={14}/> Sign out</button></div></header>
    <div className="grid border-b border-black/10 sm:grid-cols-3 dark:border-white/10"><Stat label="Published" value={published}/><Stat label="Drafts" value={drafts}/><Stat label="Collections" value={EDITORIAL.length}/></div>
    {message&&<p className="border-b border-accent/30 py-3 text-sm text-accent">{message}</p>}
    <section className="py-10"><div className="mb-5 flex items-end justify-between"><div><p className="editorial-kicker">Content library</p><h2 className="mt-1 font-display text-3xl font-black uppercase">Your sections</h2></div></div><div className="grid border-l border-t border-black/10 sm:grid-cols-2 dark:border-white/10">{EDITORIAL.map(slug=>{const meta=COLLECTIONS[slug];const title=slug==="artist-spotlights"?"Artist Spotlights":meta.label;return <Link key={slug} href={`/admin/${slug}`} className="group border-b border-r border-black/10 p-6 transition hover:bg-black/[.025] dark:border-white/10 dark:hover:bg-white/[.025]"><div className="flex items-start justify-between gap-5"><div><p className="editorial-kicker">{slug==="articles"?"Reporting":slug==="playlists"?"Curation":"Editorial"}</p><h3 className="mt-2 font-display text-3xl font-black leading-none tracking-[-.04em]">{title}</h3><p className="mt-3 max-w-md text-sm leading-5 text-neutral-500 dark:text-neutral-400">{slug==="articles"?"Articles, essays and monthly stories.":meta.description}</p></div><span className="font-mono text-3xl font-bold">{counts[slug]||0}</span></div><span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] group-hover:text-accent">Open editor <ArrowUpRight size={14}/></span></Link>;})}</div></section>
    <div className="border-t border-black/10 pt-5 text-xs text-neutral-400 dark:border-white/10">Keep drafts private. Uncheck Draft only when an entry is ready for publication.</div>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="border-r border-black/10 py-5 last:border-r-0 dark:border-white/10"><p className="editorial-meta">{label}</p><p className="mt-1 font-display text-3xl font-black">{value}</p></div>;}
