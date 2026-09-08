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
  const [articles, artists, trends, playlists] = await Promise.all([
    getCollectionEntries("articles"),
    getCollectionEntries("artist-spotlights"),
    getCollectionEntries("trend-reports"),
    getCollectionEntries("playlists")
  ]);

  const featured = articles.find((entry) => entry.frontmatter.featured) ?? articles[0];
  const supporting = articles.filter((entry) => entry !== featured).slice(0, 3);
  const latest = articles.slice(0, 4);
  const playlistPicks = playlists.slice(0, 4);

  return (
    <div className="bg-[#f4f3ee] text-[#0b0b0b]">
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="container-editorial grid lg:grid-cols-[minmax(0,2.15fr)_minmax(310px,.85fr)]">
          {featured ? (
            <Link href={`/articles/${featured.frontmatter.slug}`} className="group grid min-h-[650px] overflow-hidden bg-black text-white sm:min-h-[720px] lg:grid-rows-[minmax(0,1fr)_auto]">
              <div className="relative min-h-[390px] overflow-hidden border-b border-white/10 sm:min-h-[470px]">
                <Image src={featured.frontmatter.coverImage} alt={featured.frontmatter.coverImageAlt || featured.frontmatter.title} fill priority sizes="(min-width:1024px) 70vw, 100vw" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.018]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35" />
                <div className="absolute left-5 top-5 flex items-center gap-3 sm:left-7 sm:top-7">
                  <span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/90">01</span>
                  <span className="h-px w-8 bg-white/40" />
                  <span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/70">Featured story</span>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end lg:p-9">
                <div>
                  <p className="editorial-kicker text-[#e06a50]">{featured.frontmatter.category || "The Sound Report"}</p>
                  <h1 className="mt-3 max-w-[900px] font-display text-[clamp(3.4rem,6.2vw,6.9rem)] font-black uppercase leading-[.82] tracking-[-.065em]">{featured.frontmatter.title}</h1>
                  <p className="mt-5 max-w-2xl text-sm leading-5 text-white/65 sm:text-base">{featured.frontmatter.excerpt}</p>
                </div>
                <div className="lg:border-l lg:border-white/15 lg:pl-6">
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em]">Read the full story <ArrowRight size={15} /></span>
                  <p className="mt-7 hidden max-w-[150px] font-display text-3xl font-black uppercase leading-[.8] sm:block">Same<br />people.<br />New<br />sounds.</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="min-h-[650px] bg-black sm:min-h-[720px]" />
          )}

          <aside className="divide-y divide-white/10 bg-[#0c0c0c] text-white">
            <div className="hidden p-6 sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/45">The Sound Report · 2026</p>
              <p className="mt-3 max-w-[220px] font-display text-4xl font-black uppercase leading-[.82]">Music.<br />People.<br />Culture.</p>
            </div>
            {supporting.map((entry, index) => (
              <Link key={entry.frontmatter.slug} href={`/articles/${entry.frontmatter.slug}`} className="group grid min-h-[190px] grid-cols-[96px_1fr] gap-4 p-5 transition hover:bg-white/[.045] sm:min-h-[205px] sm:grid-cols-[112px_1fr] sm:p-6">
                <div className="relative overflow-hidden bg-neutral-800">
                  <Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="112px" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <div className="min-w-0 self-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-[.18em] text-[#e06a50]">0{index + 2}</span>
                    <span className="text-[8px] font-bold uppercase tracking-[.18em] text-white/45">{entry.frontmatter.category || "Article"}</span>
                  </div>
                  <h2 className="mt-2 font-display text-xl font-black leading-[.92] tracking-[-.035em] sm:text-[1.65rem]">{entry.frontmatter.title}</h2>
                  <p className="mt-3 text-[9px] uppercase tracking-[.1em] text-white/45">{entry.readingTimeMinutes} min read</p>
                </div>
              </Link>
            ))}
            {!supporting.length && <div className="p-8 text-sm text-white/50">More stories coming soon.</div>}
          </aside>
        </div>
      </section>

      {/* LATEST */}
      <section className="container-editorial py-12 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="lg:pt-1">
            <p className="editorial-kicker">The latest</p>
            <h2 className="mt-5 max-w-[170px] font-display text-5xl font-black uppercase leading-[.82] tracking-[-.065em] sm:text-6xl">More<br />Music.<br />Better<br />Days.</h2>
            <MoveDownRight className="mt-7" size={30} strokeWidth={1.5} />
          </div>
          <div className="grid border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
            {latest.slice(0, 3).map((entry) => <EditorialCard key={entry.frontmatter.slug} entry={entry} />)}
          </div>
        </div>
      </section>

      {/* PLAYLISTS */}
      <section className="border-y border-black/10">
        <div className="container-editorial grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[430px] overflow-hidden border-r border-black/10 bg-black sm:min-h-[520px]">
            <Image src="/images/about-hero.jpg" alt="Music crowd" fill sizes="50vw" className="object-cover grayscale" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute left-7 top-7 max-w-[190px] font-display text-4xl font-black uppercase leading-[.82] text-white sm:text-5xl">Good<br />Music<br />Brighter<br />People</div>
            <p className="absolute bottom-7 left-7 text-[9px] font-bold uppercase tracking-[.15em] text-white/80">Curated listening · The Sound Report</p>
          </div>

          <div className="p-7 sm:p-10 lg:p-14">
            <p className="editorial-kicker">Featured collection</p>
            <h2 className="mt-4 max-w-xl font-display text-5xl font-black uppercase leading-[.82] tracking-[-.065em] sm:text-6xl">Playlists for<br />what&apos;s next</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-neutral-600">Carefully curated playlists for every mood, moment and movement.</p>
            <Link href="/playlists" className="mt-7 inline-flex items-center gap-2 bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-white transition hover:bg-accent">Explore playlists <ArrowUpRight size={14} /></Link>

            <div className="mt-9 border-t border-black/10">
              {playlistPicks.map((entry) => (
                <Link key={entry.frontmatter.slug} href={`/playlists/${entry.frontmatter.slug}`} className="group grid grid-cols-[52px_1fr_30px] items-center gap-4 border-b border-black/10 py-3">
                  <div className="relative h-12 w-12 overflow-hidden bg-neutral-200">
                    <Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="48px" className="object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold uppercase tracking-[.03em]">{entry.frontmatter.title}</p>
                    <p className="mt-1 text-[8px] uppercase tracking-[.1em] text-neutral-500">The Sound Report · Playlist</p>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-xs transition group-hover:border-accent group-hover:text-accent">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL NEWSROOM */}
      <section className="container-editorial py-12 sm:py-16">
        <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-4">
          <div><p className="editorial-kicker">From the newsroom</p><h2 className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-[-.055em] sm:text-5xl">Stories that move music</h2></div>
          <Link href="/articles" className="link-arrow hidden sm:inline-flex">All articles ↗</Link>
        </div>
        <div className="mt-1">
          {articles.slice(0, 5).map((entry) => <ArticleListItem key={entry.frontmatter.slug} entry={entry} />)}
        </div>
      </section>

      {/* THREE EDITORIAL RAILS */}
      <section className="border-y border-black/10">
        <div className="container-editorial grid sm:grid-cols-3">
          <FeatureRail title="Artists" entry={artists[0]} />
          <FeatureRail title="Trends" entry={trends[0]} />
          <FeatureRail title="Playlists" entry={playlists[0]} />
        </div>
      </section>

      {/* NEWSLETTER / MANIFESTO */}
      <section id="newsletter" className="bg-black text-white">
        <div className="container-editorial grid items-end gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#e06a50]">The Sound Report</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-black uppercase leading-[.8] tracking-[-.065em] sm:text-7xl">Same people.<br />New sounds.</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/60">{settings.tagline || "Independent music stories, artists, culture and ideas from India."}</p>
          </div>
          <div className="w-full max-w-md"><NewsletterForm /></div>
        </div>
      </section>
    </div>
  );
}

function FeatureRail({ title, entry }: { title: string; entry?: any }) {
  if (!entry) return <div className="border-r border-black/10 p-7 last:border-r-0"><p className="editorial-kicker">{title}</p></div>;
  return (
    <Link href={`/${entry.collection}/${entry.frontmatter.slug}`} className="group border-r border-black/10 p-6 transition hover:bg-black/[.025] last:border-r-0 sm:p-8">
      <p className="editorial-kicker">{title}</p>
      <div className="relative mt-5 aspect-[16/9] overflow-hidden bg-neutral-200"><Image src={entry.frontmatter.coverImage} alt={entry.frontmatter.title} fill sizes="33vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" /></div>
      <h3 className="mt-4 font-display text-2xl font-black uppercase leading-[.9] tracking-[-.045em]">{entry.frontmatter.title}</h3>
      <span className="link-arrow mt-4">Explore {title} ↗</span>
    </Link>
  );
}
