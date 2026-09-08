import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, BarChart3, ListMusic, Compass } from "lucide-react";
import { readSingletonPage, readSiteSettings } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = { title: "About", description: "The story, mission, and editorial approach behind The Sound Report." };
const PILLARS = [
  { icon: BookOpen, label: "Editorial", text: "Stories with context." },
  { icon: BarChart3, label: "Analysis", text: "Patterns worth noticing." },
  { icon: ListMusic, label: "Curation", text: "Music worth your time." },
  { icon: Compass, label: "Discovery", text: "A wider listening map." }
];

export default async function AboutPage() {
  const { frontmatter, body } = await readSingletonPage("about");
  const settings = await readSiteSettings();
  const bodyHtml = await renderMarkdown(body);
  return <div>
    <section className="border-b border-black/10 dark:border-white/10"><div className="container-editorial grid min-h-[520px] items-end gap-10 py-16 lg:grid-cols-[1.35fr_.65fr] lg:py-20"><AnimatedSection><p className="editorial-kicker">About {settings.siteName}</p><h1 className="mt-5 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] font-black uppercase leading-[.8] tracking-[-.065em]">Music<br /><span className="text-accent">with</span><br />context.</h1></AnimatedSection><AnimatedSection delay={.08}><div className="relative aspect-[4/5] max-h-[430px] overflow-hidden bg-neutral-200 dark:bg-neutral-800"><Image src="/images/about-hero.jpg" alt="" fill sizes="35vw" className="object-cover grayscale" /></div></AnimatedSection></div></section>
    <section className="container-editorial grid gap-10 py-12 sm:py-16 lg:grid-cols-[.7fr_1.7fr] lg:gap-16"><AnimatedSection><p className="editorial-kicker">What we do</p><p className="mt-3 max-w-xs font-display text-2xl font-black leading-tight">A closer look at what India is listening to, making and becoming.</p></AnimatedSection><AnimatedSection delay={.06} className="prose prose-neutral max-w-3xl dark:prose-invert prose-headings:font-display prose-p:leading-8 prose-a:text-accent"><div dangerouslySetInnerHTML={{ __html: bodyHtml }} /></AnimatedSection></section>
    <section className="border-y border-black/10 dark:border-white/10"><div className="container-editorial grid sm:grid-cols-2 lg:grid-cols-4">{PILLARS.map(({ icon: Icon, label, text }, i) => <div key={label} className={`border-r border-black/10 p-6 last:border-r-0 dark:border-white/10 ${i > 1 ? "border-t sm:border-t-0" : ""}`}><Icon className="text-accent" size={20} aria-hidden /><p className="mt-7 font-display text-xl font-black">{label}</p><p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{text}</p></div>)}</div></section>
    <section className="container-editorial py-12 sm:py-16"><div className="border-t border-black/10 pt-5 dark:border-white/10"><p className="editorial-kicker">The byline</p><p className="mt-4 max-w-2xl font-display text-3xl font-black leading-tight">{settings.siteName} is founded and edited by {settings.founderName}.</p></div></section>
  </div>;
}
