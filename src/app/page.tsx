import Image from "next/image";
import Link from "next/link";
import { getCollectionEntries, readSiteSettings } from "@/lib/content";
import EditorialCard from "@/components/EditorialCard";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await readSiteSettings();
  const [articles, artists, trends, playlists] = await Promise.all([
    getCollectionEntries("articles"),
    getCollectionEntries("artist-spotlights"),
    getCollectionEntries("trend-reports"),
    getCollectionEntries("playlists"),
  ]);

  const featured = articles.find((entry) => entry.frontmatter.featured) ?? articles[0];
  const latestArticles = articles.slice(0, 4);
  const latestArtists = artists.slice(0, 3);
  const latestTrends = trends.slice(0, 3);
  const latestPlaylists = playlists.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0a0a0c] text-white">
        <div className="absolute inset-0 opacity-45">
          <Image src="/images/hero-crowd.jpg" alt="" fill priority className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/75 to-[#0a0a0c]/25" />
        <div className="container-editorial relative flex min-h-[68vh] flex-col justify-end py-20 sm:py-28">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[.28em] text-accent">India&apos;s music culture, documented</p>
            <h1 className="mt-5 max-w-5xl font-display text-5xl font-black uppercase leading-[.92] sm:text-7xl lg:text-8xl">
              The Sound<br /><span className="text-accent">Report.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-neutral-200 sm:text-lg">
              {settings.tagline || "Stories, artists, trends and playlists shaping the sound of now."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/articles" className="pill-btn">Read the latest</Link>
              <Link href="/playlists" className="pill-btn-outline">Explore playlists</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {featured && (
        <section className="container-editorial py-16 sm:py-20">
          <SectionHeading eyebrow="Featured" title="The story to read now" href={`/articles/${featured.frontmatter.slug}`} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
            <Link href={`/articles/${featured.frontmatter.slug}`} className="group overflow-hidden rounded-2xl bg-black">
              <div className="relative aspect-[16/9]">
                <Image src={featured.frontmatter.coverImage} alt={featured.frontmatter.coverImageAlt || featured.frontmatter.title} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 66vw, 100vw" />
              </div>
            </Link>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">{featured.frontmatter.category}</p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">{featured.frontmatter.title}</h2>
              <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">{featured.frontmatter.excerpt}</p>
              <Link href={`/articles/${featured.frontmatter.slug}`} className="link-arrow mt-6 w-fit">Read article →</Link>
            </div>
          </div>
        </section>
      )}

      <ContentSection title="Latest Articles" href="/articles" entries={latestArticles} />
      <ContentSection title="Artists" href="/artist-spotlights" entries={latestArtists} />
      <ContentSection title="Trends" href="/trend-reports" entries={latestTrends} />
      <ContentSection title="Playlists" href="/playlists" entries={latestPlaylists} />

      <section className="border-t border-black/5 bg-black/[.025] py-16 dark:border-white/10 dark:bg-white/[.025]">
        <div className="container-editorial grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">About The Sound Report</p>
          <div>
            <h2 className="font-display text-3xl font-black sm:text-4xl">A closer look at what India is listening to, making and becoming.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-neutral-600 dark:text-neutral-300">The Sound Report is an independent music publication covering artists, music culture, industry shifts and the playlists that stay on repeat.</p>
            <Link href="/about" className="link-arrow mt-5 inline-block">About the publication →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, href }: { eyebrow?: string; title: string; href: string }) {
  return <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-4 dark:border-white/10"><div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent">{eyebrow}</p>}<h2 className="font-display text-3xl font-black sm:text-4xl">{title}</h2></div><Link href={href} className="link-arrow hidden sm:block">View all →</Link></div>;
}

function ContentSection({ title, href, entries }: { title: string; href: string; entries: any[] }) {
  if (!entries.length) return null;
  return <section className="container-editorial py-14 sm:py-16"><SectionHeading title={title} href={href} /><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{entries.map((entry, i) => <AnimatedSection key={`${entry.collection}-${entry.frontmatter.slug}`} delay={i * .05}><EditorialCard entry={entry} /></AnimatedSection>)}</div><Link href={href} className="link-arrow mt-6 inline-block sm:hidden">View all →</Link></section>;
}
