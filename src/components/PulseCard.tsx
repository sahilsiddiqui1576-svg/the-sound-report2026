import Link from "next/link";
import type { Song } from "@/lib/pulse";

export default function PulseCard({ song, featured = false }: { song: Song; featured?: boolean }) {
  return (
    <Link href={`/songs/${song.id}`} className={`group block border border-black/10 bg-white p-5 transition hover:-translate-y-1 hover:border-black dark:border-white/10 dark:bg-neutral-950 dark:hover:border-white/30 ${featured ? "min-h-72" : "min-h-56"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">{song.label}</span>
        <span className="font-mono text-sm font-bold">{song.score}</span>
      </div>
      <div className="mt-10">
        <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{song.language} · {song.region}</p>
        <h3 className={`mt-2 font-display font-black uppercase leading-none ${featured ? "text-4xl" : "text-2xl"}`}>{song.title}</h3>
        <p className="mt-2 font-medium">{song.artist}</p>
      </div>
      <div className="mt-7 flex items-end justify-between border-t border-black/10 pt-4 dark:border-white/10">
        <div><span className="block text-[10px] uppercase tracking-wider text-neutral-500">Momentum</span><span className="font-mono font-bold">↑ {song.movement ?? 0}%</span></div>
        <span className="text-sm font-bold transition group-hover:translate-x-1">Explore →</span>
      </div>
    </Link>
  );
}
