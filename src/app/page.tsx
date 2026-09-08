import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MoveDownRight } from "lucide-react";
import { getCollectionEntries, readSiteSettings } from "@/lib/content";
import EditorialCard from "@/components/EditorialCard";
import ArticleListItem from "@/components/ArticleListItem";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await readSiteSettings();
  const hp = settings.homepage ?? {};
  const [articles, artists, trends, playlists] = await Promise.all([getCollectionEntries("articles"), getCollectionEntries("artist-spotlights"), getCollectionEntries("trend-reports"), getCollectionEntries("playlists")]);

  const featured = (hp.heroSlug ? articles.find((entry) => entry.frontmatter.slug === hp.heroSlug) : undefined) ?? articles.find((entry) => entry.frontmatter.featured) ?? articles[0];
  const supporting = articles.filter((entry) => entry !== featured).slice(0, 3);
  const latest = articles.slice(0, 3);
  const playlistPicks = playlists.slice(0, 4);
  const heroImage = hp.heroImage || featured?.frontmatter.coverImage;

  return (
    <div className="bg-[#f4f3ee] text-[#0b0b0b]">
      <section className="border-b border-black/10">
        <div className="container-editorial grid lg:grid-cols-[minmax(0,1.9fr)_minmax(360px,1fr)]">
          {featured ? (
            <Link href={`/articles/${featured.frontmatter.slug}`} className="group grid min-h-[590px] overflow-hidden bg-black text-white sm:min-h-[640px] lg:min-h-[660px] lg:grid-rows-[minmax(0,1fr)_auto]">
              <div className="relative min-h-[360px] overflow-hidden border-b border-white/10 sm:min-h-[420px]">
                <Image src={heroImage || "/images/hero-crowd.jpg"} alt={featured.frontmatter.coverImageAlt || featured.frontmatter.title} fill priority sizes="(min-width:1024px) 65vw, 100vw" className="object-cover transition duration-[1000ms] ease-out group-hover:scale-[1.015]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
                <div className="absolute left-6 top-6 flex items-center gap-3 sm:left-8 sm:top-8"><span className="text-[11px] font-bold uppercase tracking-[.18em]">01</span><span className="h-px w-10 bg-white/40" /><span className="text-[11px] font-bold uppercase tracking-[.18em] text-white/70">Featured story</span></div>
              </div>
              <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-end lg:p-8">
                <div><p className="editorial-kicker text-[#e06a50]">{featured.frontmatter.category || "The Sound Report"}</p><h1 className="mt-3 max-w-[860px] font-display text-[clamp(3rem,5.5vw,6rem)] font-black uppercase leading-[.84] tracking-[-.06em]">{featured.frontmatter.title}</h1><p className="mt-4 max-w-2xl text-sm leading-5 text-white/65 sm:text-base">{featured.frontmatter.excerpt}</p></div>
                <div className="lg:border-l lg:border-white/15 lg:pl-5"><span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.1em]">Read full story <ArrowRight size={16} /></span><p className="mt-6 hidden font-display text-2xl font-black uppercase leading-[.82] sm:block">Same<br />people.<br />New<br />sounds.</p></div>
              </div>
            </Link>
          ) : <div className="min-h-[590px] bg-black" />}

          <aside className="divide-y divide-white/10 bg-[#0c0c0c] text-white">
            <div className="p-6 sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">The Sound Report · 2026</p><p className="mt-3 max-w-[260px] font-display text-4xl font-black uppercase leading-[.82] sm:text-5xl">Music.<br />People.<br />Culture.</p></div>
            {supporting.map((entry, index) => <Link key={entry.frontmatter.slug} href={`/articles/${entry.frontmatter.slug}`} className="group grid min-h-[175px] grid-cols-[104px_1fr] gap-4 p-5 transition hover:bg-white/[.045] sm:min-h-[185px] sm:grid-cols-[118px_1fr] sm:p-6"><div className="relative overflow-hidden bg-neutral-800"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="118px" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" /></div><div className="min-w-0 self-center"><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e06a50]">0{index + 2}</span><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">{entry.frontmatter.category || "Article"}</span></div><h2 className="mt-2 font-display text-[1.55rem] font-black leading-[.9] tracking-[-.035em]">{entry.frontmatter.title}</h2><p className="mt-3 text-[10px] uppercase tracking-[.1em] text-white/45">{entry.readingTimeMinutes} min read</p></div></Link>)}
            {!supporting.length && <div className="p-8 text-sm text-white/50">More stories coming soon.</div>}
          </aside>
        </div>
      </section>

      <section className="container-editorial py-14 sm:py-18 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div><p className="editorial-kicker">The latest</p><h2 className="mt-4 max-w-[190px] font-display text-5xl font-black uppercase leading-[.84] tracking-[-.06em] sm:text-6xl">{splitHeading(hp.latestHeading || "More Music. Better Days.")}</h2><MoveDownRight className="mt-7" size={28} strokeWidth={1.5} /></div>
          <div className="grid border-t border-black/10 sm:grid-cols-3">{latest.map((entry) => <EditorialCard key={entry.frontmatter.slug} entry={entry} />)}</div>
        </div>
        {hp.latestSubheading && <p className="mt-6 ml-[220px] max-w-xl text-sm leading-6 text-neutral-500 lg:block">{hp.latestSubheading}</p>}
      </section>

      <section className="border-y border-black/10">
        <div className="container-editorial grid lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[420px] overflow-hidden border-r border-black/10 bg-black sm:min-h-[500px]"><Image src={hp.playlistImage || "/images/about-hero.jpg"} alt="Curated music listening" fill sizes="50vw" className="object-cover grayscale" /><div className="absolute inset-0 bg-black/35" /><div className="absolute left-7 top-7 max-w-[230px] font-display text-4xl font-black uppercase leading-[.82] text-white sm:text-5xl">Good<br />Music<br />Brighter<br />People</div><p className="absolute bottom-7 left-7 text-[10px] font-bold uppercase tracking-[.15em] text-white/80">Curated listening · The Sound Report</p></div>
          <div className="p-7 sm:p-10 lg:p-14"><p className="editorial-kicker">Featured collection</p><h2 className="mt-4 max-w-xl font-display text-5xl font-black uppercase leading-[.84] tracking-[-.06em] sm:text-6xl">{splitHeading(hp.playlistHeading || "Playlists for what's next")}</h2><p className="mt-5 max-w-md text-sm leading-6 text-neutral-600">{hp.playlistBody || "Carefully curated playlists for every mood, moment and movement."}</p><Link href="/playlists" className="mt-7 inline-flex items-center gap-2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[.12em] text-white transition hover:bg-accent">Explore playlists <ArrowUpRight size={15} /></Link><div className="mt-9 border-t border-black/10">{playlistPicks.map((entry) => <Link key={entry.frontmatter.slug} href={`/playlists/${entry.frontmatter.slug}`} className="group grid grid-cols-[54px_1fr_32px] items-center gap-4 border-b border-black/10 py-3"><div className="relative h-12 w-12 overflow-hidden bg-neutral-200"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="48px" className="object-cover transition group-hover:scale-105" /></div><div className="min-w-0"><p className="truncate text-[12px] font-bold uppercase">{entry.frontmatter.title}</p><p className="mt-1 text-[9px] uppercase tracking-[.1em] text-neutral-500">The Sound Report · Playlist</p></div><span className="flex h-8 w-8 items-center justify-center border border-black/15 text-sm transition group-hover:border-accent group-hover:text-accent">→</span></Link>)}</div></div>
        </div>
      </section>

      <section className="container-editorial py-14 sm:py-18"><div className="flex items-end justify-between gap-5 border-b border-black/10 pb-4"><div><p className="editorial-kicker">From the newsroom</p><h2 className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-[-.055em] sm:text-5xl">Stories that move music</h2></div><Link href="/articles" className="link-arrow hidden sm:inline-flex">All articles ↗</Link></div><div className="mt-1">{articles.slice(0, 5).map((entry) => <ArticleListItem key={entry.frontmatter.slug} entry={entry} />)}</div></section>

      <section className="border-y border-black/10"><div className="container-editorial grid sm:grid-cols-3"><FeatureRail title="Artists" entry={artists[0]} /><FeatureRail title="Trends" entry={trends[0]} /><FeatureRail title="Playlists" entry={playlists[0]} /></div></section>

      <section id="newsletter" className="bg-black text-white"><div className="container-editorial grid items-end gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto]"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e06a50]">The Sound Report</p><h2 className="mt-3 max-w-3xl font-display text-5xl font-black uppercase leading-[.82] tracking-[-.065em] sm:text-7xl">{splitHeading(hp.newsletterHeading || "Same people. New sounds.")}</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/60">{hp.newsletterBody || settings.tagline || "Independent music stories, artists, culture and ideas from India."}</p></div><div className="w-full max-w-md"><NewsletterForm /></div></div></section>
    </div>
  );
}

function splitHeading(value: string) { return value.split(/\s+/).map((word, i) => <span key={`${word}-${i}`} className="mr-[.18em] inline-block">{word}</span>); }

function FeatureRail({ title, entry }: { title: string; entry?: any }) {
  if (!entry) return <div className="border-r border-black/10 p-7"><p className="editorial-kicker">{title}</p></div>;
  return <Link href={`/${entry.collection}/${entry.frontmatter.slug}`} className="group border-r border-black/10 p-6 transition hover:bg-black/[.025] sm:p-8"><p className="editorial-kicker">{title}</p><div className="relative mt-5 aspect-[16/9] overflow-hidden bg-neutral-200"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="33vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" /></div><h3 className="mt-4 font-display text-2xl font-black uppercase leading-[.9] tracking-[-.045em]">{entry.frontmatter.title}</h3><span className="link-arrow mt-4">Explore {title} ↗</span></Link>;
}
