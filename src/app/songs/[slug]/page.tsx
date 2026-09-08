import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSongBySlug } from "@/lib/music";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) return {};
  return { title: song.title, description: song.editorial_note || `${song.title} by ${song.artist?.name ?? "the artist"}. Sound Report song intelligence.` };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);
  if (!song) notFound();

  return (
    <article className="container-editorial py-12 sm:py-16">
      <Link href="/songs" className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 hover:text-accent">← All songs</Link>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Sound Report song intelligence</p>
          <h1 className="mt-4 max-w-4xl font-display text-6xl font-black uppercase leading-[.85] sm:text-8xl">{song.title}</h1>
          <p className="mt-5 font-display text-2xl font-bold">{song.artist?.name ?? "Artist pending"}</p>
          <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            {[song.language, song.region, song.genre, song.label].filter(Boolean).map((item) => <span key={item} className="border border-black/10 px-3 py-2 dark:border-white/10">{item}</span>)}
          </div>
          {song.editorial_note && <p className="mt-10 max-w-2xl text-xl leading-relaxed text-neutral-600 dark:text-neutral-300">{song.editorial_note}</p>}
        </div>

        <aside className="border border-black/10 dark:border-white/10">
          <div className="bg-black p-6 text-white dark:bg-white dark:text-black">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">TSR Score</p>
            <p className="mt-2 font-display text-7xl font-black">{song.score ?? "—"}</p>
            <p className="mt-1 text-sm opacity-60">out of 100</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-black/10 p-5 dark:border-white/10"><p className="font-mono text-[9px] uppercase text-neutral-500">Current rank</p><p className="mt-2 font-display text-3xl font-black">{song.rank ?? "—"}</p></div>
            <div className="border-b border-black/10 p-5 dark:border-white/10"><p className="font-mono text-[9px] uppercase text-neutral-500">Movement</p><p className="mt-2 font-display text-3xl font-black">{song.rank_change == null ? "—" : song.rank_change > 0 ? `↑${song.rank_change}` : song.rank_change < 0 ? `↓${Math.abs(song.rank_change)}` : "→"}</p></div>
          </div>
          <div className="p-5">
            <p className="font-mono text-[9px] uppercase text-neutral-500">Listen</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[[song.spotify_url, "Spotify"], [song.apple_music_url, "Apple Music"], [song.amazon_music_url, "Amazon Music"], [song.youtube_url, "YouTube"]].filter(([url]) => url).map(([url, label]) => <a key={label} href={url!} target="_blank" rel="noreferrer" className="border border-black/10 px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent dark:border-white/10">{label}</a>)}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
