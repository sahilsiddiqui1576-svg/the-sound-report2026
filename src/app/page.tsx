import Link from "next/link";
import PulseCard from "@/components/PulseCard";
import { fastestRiser, keyNumbers, rankByScore, pulseSongs } from "@/lib/pulse";

const top = rankByScore();
const riser = fastestRiser();

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-black/10 bg-[#f5f3ee] dark:border-white/10 dark:bg-[#0b0b0d]">
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em]"><span>The Sound Report</span><span>India · Music Intelligence</span></div>
          <div className="py-24 sm:py-32 lg:py-40">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">Updated daily · September 2026</p>
            <h1 className="max-w-6xl font-display text-[clamp(4rem,11vw,10rem)] font-black uppercase leading-[.78] tracking-[-.07em]">India&apos;s<br /><span className="text-[#ff4d2e]">Music Pulse.</span></h1>
            <div className="mt-10 flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">The data, artists and stories shaping how India listens. One place for the signal behind the noise.</p><Link href="/trends" className="shrink-0 border border-black bg-black px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[#ff4d2e] hover:border-[#ff4d2e] dark:border-white dark:bg-white dark:text-black">Explore the pulse →</Link></div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12"><div className="grid border-l border-t border-black/10 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {[["#1 SONG", top[0].title, top[0].artist],["FASTEST RISER", riser.title, `↑ ${riser.movement}% this period`],["BIGGEST YOUTUBE MOMENT","Track the velocity","Official video + music discovery"],["REGIONAL BREAKOUT","Radhimaa","Tamil · South India"]].map(([label,value,note])=><div key={label} className="border-b border-r border-black/10 p-6 dark:border-white/10"><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-neutral-500">{label}</p><p className="mt-8 font-display text-3xl font-black uppercase leading-none">{value}</p><p className="mt-3 text-sm text-neutral-500">{note}</p></div>)}
      </div></section>
      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12"><div className="mb-7 flex items-end justify-between border-b border-black pb-4 dark:border-white"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Live ranking</p><h2 className="mt-2 font-display text-4xl font-black uppercase">The Pulse</h2></div><span className="font-mono text-xs text-neutral-500">TSR SCORE / 100</span></div><div className="grid gap-4 lg:grid-cols-3">{top.slice(0,3).map((song,i)=><PulseCard key={song.id} song={song} featured={i===0}/>)}</div></section>
      <section className="bg-black py-14 text-white dark:bg-white dark:text-black"><div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12"><p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">The numbers</p><h2 className="mt-2 font-display text-4xl font-black uppercase">India by the numbers</h2><div className="mt-8 grid border-l border-white/20 dark:border-black/20 sm:grid-cols-2 lg:grid-cols-4">{keyNumbers.map(item=><div key={item.value} className="border-b border-r border-white/20 p-6 dark:border-black/20"><p className="font-display text-5xl font-black">{item.value}</p><p className="mt-3 max-w-[18rem] text-sm opacity-60">{item.label}</p></div>)}</div></div></section>
      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12"><div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Editorial</p><h2 className="mt-2 max-w-3xl font-display text-5xl font-black uppercase leading-[.9]">The Indian music economy is getting bigger than Bollywood.</h2><p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">Independent pop, regional languages and global discovery are changing the shape of the market. We follow the numbers, then tell you what they mean.</p><Link href="/articles" className="mt-8 inline-block border-b-2 border-[#ff4d2e] pb-1 text-sm font-bold uppercase tracking-wider">Read the analysis →</Link></div><div className="border border-black/10 p-6 dark:border-white/10"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">This week</p>{pulseSongs.slice(0,4).map((song,i)=><div key={song.id} className="flex items-center justify-between border-b border-black/10 py-5 last:border-0 dark:border-white/10"><div><p className="font-bold uppercase">{song.title}</p><p className="text-sm text-neutral-500">{song.artist}</p></div><span className="font-mono text-sm">0{i+1}</span></div>)}</div></div></section>
      <section className="border-t border-black/10 px-5 py-16 text-center dark:border-white/10 sm:px-8"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">The Sound Report</p><h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-black uppercase">Follow the sound. Understand the market.</h2><p className="mx-auto mt-4 max-w-xl text-neutral-500">Weekly picks, artist intelligence, trend reports and the data behind India&apos;s music culture.</p></section>
    </main>
  );
}
