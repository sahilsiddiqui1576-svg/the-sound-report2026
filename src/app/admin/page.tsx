"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COLLECTIONS } from "@/lib/types";

const EDITORIAL = ["articles", "artist-spotlights", "trend-reports", "playlists"] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("content_entries").select("collection");
      const next: Record<string, number> = {};
      data?.forEach((row) => { next[row.collection] = (next[row.collection] || 0) + 1; });
      setCounts(next);
    })();
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    location.href = "/admin/login";
  }

  async function importContent() {
    setMessage("Loading the bundled editorial content…");
    const response = await fetch("/api/admin/import?replace=true", { method: "POST" });
    const data = await response.json();
    setMessage(response.ok ? `Loaded ${data.imported} editorial items.` : (data.error || "Could not load content."));
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0c]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">The Sound Report</p>
            <h1 className="mt-2 font-display text-4xl font-black">Editorial Desk</h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">Publish the stories, artists, trends and playlists that make up the publication.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={importContent} className="rounded-full border border-accent/40 px-4 py-2 text-sm font-semibold">Load bundled content</button>
            <button onClick={logout} className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10">Sign out</button>
          </div>
        </div>

        {message && <p className="mt-5 text-sm text-neutral-500">{message}</p>}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {EDITORIAL.map((slug) => {
            const meta = COLLECTIONS[slug];
            return (
              <Link key={slug} href={`/admin/${slug}`} className="group rounded-3xl border border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:border-accent/50 dark:border-white/10 dark:bg-white/[.04]">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">{slug === "artist-spotlights" ? "Artists" : meta.label}</p>
                    <h2 className="mt-2 font-display text-2xl font-black">{slug === "artist-spotlights" ? "Artist Spotlights" : meta.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{slug === "articles" ? "Monthly articles, essays and editorial stories." : meta.description}</p>
                  </div>
                  <span className="rounded-full bg-black/[.05] px-3 py-1 text-xs font-bold dark:bg-white/10">{counts[slug] || 0}</span>
                </div>
                <p className="mt-6 text-sm font-bold group-hover:text-accent">Open editor →</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[.04]">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Publishing model</p>
          <h2 className="mt-2 font-display text-xl font-black">Keep it simple.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Create an article, artist spotlight, trend report or playlist. Save it as a draft while you work, then untick Draft when it is ready for the public site.</p>
        </div>
      </div>
    </main>
  );
}
