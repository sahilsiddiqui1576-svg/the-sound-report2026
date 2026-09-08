import Link from "next/link";
import type { Metadata } from "next";
import { getSongFacets, getSongs } from "@/lib/music";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Songs",
  description: "The Sound Report song intelligence database for India."
};

export default async function SongsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; language?: string; region?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const [songs, facets] = await Promise.all([
    getSongs(params),
    getSongFacets()
  ]);

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="border-b border-black pb-8 dark:border-white">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Music intelligence</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl font-black uppercase leading-none sm:text-7xl">Songs</h1>
            <p className="mt-4 max-w-2xl text-neutral-500 dark:text-neutral-400">A living index of the songs shaping India&apos;s listening landscape, ranked by the Sound Report signal.</p>
          </div>
          <Link href="/charts" className="text-sm font-bold uppercase tracking-wider text-accent">Open charts →</Link>
        </div>
      </div>

      <form className="mt-8 grid gap-3 md:grid-cols-4" method="get">
        <input name="q" defaultValue={params.q} placeholder="Search a song" className="border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent dark:border-white/15 md:col-span-2" />
        <select name="language" defaultValue={params.language ?? ""} className="border border-black/15 bg-transparent px-4 py-3 text-sm dark:border-white/15">
          <option value="">All languages</option>{facets.languages.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select name="genre" defaultValue={params.genre ?? ""} className="border border-black/15 bg-transparent px-4 py-3 text-sm dark:border-white/15">
          <option value="">All genres</option>{facets.genres.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select name="region" defaultValue={params.region ?? ""} className="border border-black/15 bg-transparent px-4 py-3 text-sm dark:border-white/15">
          <option value="">All regions</option>{facets.regions.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <button className="bg-black px-5 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-accent dark:bg-white dark:text-black md:col-span-3" type="submit">Filter songs</button>
      </form>

      <div className="mt-10 overflow-hidden border-t border-black/10 dark:border-white/10">
        <div className="hidden grid-cols-[56px_minmax(0,1fr)_120px_100px_90px] gap-4 border-b border-black/10 py-3 font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:border-white/10 md:grid">
          <span>#</span><span>Song</span><span>Language</span><span>TSR Score</span><span>Move</span>
        </div>
        {songs.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500">No songs are in the database yet. Once the first verified data import lands, they will appear here.</div>
        ) : songs.map((song, index) => (
          <Link key={song.id} href={`/songs/${song.slug}`} className="grid grid-cols-1 gap-3 border-b border-black/10 py-5 transition hover:bg-black/[.025] md:grid-cols-[56px_minmax(0,1fr)_120px_100px_90px] md:items-center md:gap-4 dark:border-white/10 dark:hover:bg-white/[.025]">
            <span className="font-mono text-xs text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
            <span><strong className="block font-display text-xl font-black uppercase">{song.title}</strong><span className="text-sm text-neutral-500">{song.artist?.name ?? "Artist pending"}{song.album_title ? ` · ${song.album_title}` : ""}</span></span>
            <span className="font-mono text-xs uppercase text-neutral-500">{song.language ?? "—"}</span>
            <span className="font-mono text-lg font-bold">{song.score ?? "—"}</span>
            <span className={`font-mono text-xs font-bold ${(song.rank_change ?? 0) > 0 ? "text-accent" : "text-neutral-500"}`}>{song.rank_change == null ? "—" : song.rank_change > 0 ? `↑ ${song.rank_change}` : song.rank_change < 0 ? `↓ ${Math.abs(song.rank_change)}` : "→ 0"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
