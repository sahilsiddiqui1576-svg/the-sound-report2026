import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = { title: "Search", description: "Search The Sound Report's stories, artists and playlists." };

export default function SearchPage() {
  return <div><section className="border-b border-black/10 dark:border-white/10"><div className="container-editorial py-14 sm:py-20"><AnimatedSection><p className="editorial-kicker">The archive</p><h1 className="mt-4 font-display text-[clamp(4rem,9vw,8rem)] font-black uppercase leading-[.8] tracking-[-.065em]">Find<br /><span className="text-accent">a story.</span></h1><p className="mt-6 max-w-xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">Search across the publication archive by title, artist, genre, mood or language.</p></AnimatedSection></div></section><div className="container-editorial py-8 sm:py-12"><SearchClient /></div></div>;
}
