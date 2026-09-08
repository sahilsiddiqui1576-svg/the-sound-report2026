import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveDownRight } from "lucide-react";
import { getCollectionEntries, readSiteSettings } from "@/lib/content";
import EditorialCard from "@/components/EditorialCard";
import ArticleListItem from "@/components/ArticleListItem";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await readSiteSettings();
  const [articles, artists, trends, playlists] = await Promise.all([
    getCollectionEntries("articles"),
    getCollectionEntries("artist-spotlights"),
    getCollectionEntries("trend-reports"),
    getCollectionEntries("playlists")
  ]);
  const featured = articles.find((entry) => entry.frontmatter.featured) ?? articles[0];
  const supporting = articles.filter((entry) => entry !== featured).slice(0, 3);
  const latest = articles.slice(0, 6);

  return <div>
    <section className="border-b border-black/10 bg-[#0b0b0d] text-white dark:border-white/10">
      <div className="container-editorial grid min-h-[620px] grid-cols-1 lg:grid-cols-[1.05fr_1.65fr]">
        <div className="flex flex-col justify-end border-b border-white/10 py-14 lg:border-b-0 lg:border-r lg:pr-12 lg:py-20">
          <AnimatedSection>
            <p className="editorial-kicker">Independent music publication · India · 2026</p>
            <h1 className="mt-5 max-w-xl font-display text-[clamp(4rem,9vw,8.5rem)] font-black uppercase leading-[.82] tracking-[-.065em]">The Sound<br /><span className="text-accent">Report.</span></h1>
            <p className="mt-7 max-w-md text-sm leading-6 text-neutral-300 sm:text-base">{settings.tagline || "Stories, artists, ideas and sounds shaping the culture around Indian music."}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={featured ? `/articles/${featured.frontmatter.slug}` : "/articles"} className="inline-flex items-center gap-3 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-black transition hover:bg-accent">Read the lead story <ArrowUpRight size={15} /></Link>
              <Link href="/playlists" className="inline-flex items-center border border-white/25 px-5 py-3 text-xs font-bold uppercase tracking-[.12em] transition hover:border-accent hover:text-accent">Listen</Link>
            </div>
          </AnimatedSection>
        </div>
        <div className="grid min-h-[620px] grid-cols-1 sm:grid-cols-[1.6fr_.7fr]">
          {featured && <Link href={`/articles/${featured.frontmatter.slug}`} className="group relative min-h-[390px] overflow-hidden sm:min-h-0">
            <Image src={featured.frontmatter.coverImage} alt={featured.frontmatter.coverImageAlt || featured.frontmatter.title} fill priority sizes="(min-width: 640px) 55vw, 100vw" className="object-cover transition duration-1000 group-hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-9">
              <p className="editorial-kicker">{featured.frontmatter.category || "Featured"}</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-black leading-[.92] tracking-[-.04em] sm:text-6xl">{featured.frontmatter.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-5 text-neutral-200">{featured.frontmatter.excerpt}</p>
            </div>
          </Link>}
          <div className="divide-y divide-white/10 border-t border-white/10 sm:border-t-0">
            {supporting.map((entry) => <Link key={entry.frontmatter.slug} href={`/articles/${entry.frontmatter.slug}`} className="group flex min-h-[120px] gap-3 p-4 transition hover:bg-white/[.05]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-neutral-800"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="80px" className="object-cover transition group-hover:scale-105" /></div>
              <div><p className="editorial-kicker">{entry.frontmatter.category || "Story"}</p><h3 className="mt-1 font-display text-base font-bold leading-tight">{entry.frontmatter.title}</h3><p className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">{entry.readingTimeMinutes} min read</p></div>
            </Link>)}
          </div>
        </div>
      </div>
    </section>

    <section className="container-editorial py-14 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[.65fr_2.35fr] lg:gap-12">
        <div><p className="editorial-kicker">The latest</p><h2 className="mt-3 max-w-xs font-display text-5xl font-black uppercase leading-[.86] tracking-[-.05em] sm:text-6xl">More music.<br />Better<br />days.</h2><MoveDownRight className="mt-8 text-accent" size={32} /></div>
        <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.slice(0, 3).map((entry) => <EditorialCard key={entry.frontmatter.slug} entry={entry} />)}
        </div>
      </div>
    </section>

    <section className="bg-black text-white dark:bg-white dark:text-black">
      <div className="container-editorial grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[420px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r dark:border-black/10">
          <Image src="/images/about-hero.jpg" alt="" fill sizes="50vw" className="object-cover grayscale transition duration-700 hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-black/35" />
          <p className="absolute bottom-7 left-7 max-w-xs font-display text-3xl font-black uppercase leading-[.9]">A platform for a more curious music culture.</p>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="editorial-kicker">The Sound Report</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-black leading-[.9] tracking-[-.045em] sm:text-6xl">Same people.<br />New sounds.</h2>
          <p className="mt-6 max-w-lg text-sm leading-6 opacity-70">An independent publication covering the artists, culture, trends and industry shaping India&apos;s musical present.</p>
          <Link href="/about" className="mt-8 inline-flex w-fit items-center gap-2 border border-current px-5 py-3 text-xs font-bold uppercase tracking-[.14em] transition hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white">About the publication <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>

    <section className="container-editorial py-14 sm:py-20">
      <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-4 dark:border-white/10"><div><p className="editorial-kicker">From the newsroom</p><h2 className="mt-2 font-display text-4xl font-black uppercase tracking-[-.04em]">Latest stories</h2></div><Link href="/articles" className="link-arrow hidden sm:inline-flex">All articles ↗</Link></div>
      <div className="mt-2">{articles.slice(0, 5).map((entry) => <ArticleListItem key={entry.frontmatter.slug} entry={entry} />)}</div>
    </section>

    <section className="border-y border-black/10 dark:border-white/10">
      <div className="container-editorial grid sm:grid-cols-3">
        <FeatureRail title="Artists" href="/artist-spotlights" entry={artists[0]} />
        <FeatureRail title="Trends" href="/trend-reports" entry={trends[0]} />
        <FeatureRail title="Playlists" href="/playlists" entry={playlists[0]} />
      </div>
    </section>
  </div>;
}

function FeatureRail({ title, href, entry }: { title: string; href: string; entry?: any }) {
  if (!entry) return <div className="border-r border-black/10 p-7 last:border-r-0 dark:border-white/10"><p className="editorial-kicker">{title}</p></div>;
  return <Link href={`/${entry.collection}/${entry.frontmatter.slug}`} className="group border-r border-black/10 p-6 transition hover:bg-black/[.025] last:border-r-0 dark:border-white/10 dark:hover:bg-white/[.025] sm:p-8">
    <p className="editorial-kicker">{title}</p><div className="relative mt-5 aspect-[16/9] overflow-hidden bg-neutral-200 dark:bg-neutral-800"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><h3 className="mt-4 font-display text-2xl font-black leading-[.95] tracking-[-.03em]">{entry.frontmatter.title}</h3><span className="link-arrow mt-4">Explore {title} ↗</span>
  </Link>;
}
