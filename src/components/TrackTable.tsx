import { TrackRef } from "@/lib/types";
import StreamingLinks from "./StreamingLinks";

export default function TrackTable({ tracks, title = "Track List" }: { tracks: TrackRef[]; title?: string }) {
  if (!tracks?.length) return null;
  return <div>
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-black/10 pb-3 dark:border-white/10"><h3 className="editorial-kicker">{title}</h3><span className="editorial-meta">{tracks.length} tracks</span></div>
    <ol className="divide-y divide-black/10 dark:divide-white/10">
      {tracks.map((track, i) => <li key={`${track.title}-${i}`} className="grid gap-4 py-4 sm:grid-cols-[40px_1fr_auto] sm:items-center">
        <span className="font-mono text-xs text-neutral-400">{String(i + 1).padStart(2, "0")}</span>
        <div><p className="font-display text-lg font-bold leading-tight">{track.title}</p><p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{track.artist}{track.album ? ` · ${track.album}` : ""}</p>{track.note && <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">{track.note}</p>}</div>
        <StreamingLinks links={track.links} compact />
      </li>)}
    </ol>
  </div>;
}
