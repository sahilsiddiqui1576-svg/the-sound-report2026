import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { COLLECTIONS, CollectionSlug } from "@/lib/types";
import { getCollectionEntries, getEntryBySlug, readSiteSettings } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import TrackTable from "@/components/TrackTable";
import StreamingLinks from "@/components/StreamingLinks";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ collection: string; slug: string }> }): Promise<Metadata> {
  const { collection: collectionParam, slug } = await params;
  const collection = collectionParam as CollectionSlug;
  if (!COLLECTIONS[collection]) return {};
  const entry = await getEntryBySlug(collection, slug);
  if (!entry) return {};
  const { frontmatter } = entry;
  const settings = await readSiteSettings();
  const title = frontmatter.seoTitle || frontmatter.title;
  const description = frontmatter.seoDescription || frontmatter.excerpt;
  const image = frontmatter.seoImage || frontmatter.coverImage;
  return { title, description, alternates: frontmatter.canonicalUrl ? { canonical: frontmatter.canonicalUrl } : undefined, openGraph: { title, description, images: [image], type: "article", publishedTime: frontmatter.publishDate, siteName: settings.siteName }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function EntryDetailPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
  const { collection: collectionParam, slug } = await params;
  const collection = collectionParam as CollectionSlug;
  const meta = COLLECTIONS[collection];
  if (!meta) notFound();
  const entry = await getEntryBySlug(collection, slug);
  if (!entry) notFound();
  const { frontmatter, body, readingTimeMinutes } = entry;
  const bodyHtml = await renderMarkdown(body);
  const related = (await getCollectionEntries(collection)).filter((item) => item.frontmatter.slug !== slug).slice(0, 3);
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: frontmatter.title, datePublished: frontmatter.publishDate, dateModified: frontmatter.updatedDate || frontmatter.publishDate, image: frontmatter.coverImage, author: { "@type": "Person", name: frontmatter.author || "The Sound Report Editors" } };

  return <article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="container-editorial py-10 sm:py-14">
        <Link href={`/${collection}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-neutral-400 transition hover:text-accent"><ArrowLeft size={13} /> Back to {meta.label}</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-end">
          <AnimatedSection><p className="editorial-kicker">{frontmatter.category || meta.label}{frontmatter.month ? ` · ${frontmatter.month} ${frontmatter.year ?? ""}` : ""}</p><h1 className="mt-4 max-w-4xl font-display text-[clamp(3.2rem,7vw,7rem)] font-black leading-[.84] tracking-[-.06em]">{frontmatter.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">{frontmatter.excerpt}</p><p className="mt-5 editorial-meta">{format(new Date(frontmatter.publishDate), "MMMM d, yyyy")} · {readingTimeMinutes} min read{frontmatter.author ? ` · By ${frontmatter.author}` : ""}</p>{meta.isSpotlight && frontmatter.artistLinks && <div className="mt-5"><StreamingLinks links={frontmatter.artistLinks} /></div>}</AnimatedSection>
          <AnimatedSection delay={.08}><div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800"><Image src={frontmatter.coverImage} alt={frontmatter.coverImageAlt || frontmatter.title} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" /></div></AnimatedSection>
        </div>
      </div>
    </header>

    <div className="container-editorial grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,760px)_220px] lg:justify-between">
      <AnimatedSection className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:leading-8 prose-p:text-[16px] prose-a:text-accent">
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </AnimatedSection>
      <aside className="hidden lg:block"><div className="sticky top-28 border-t border-black/10 pt-4 dark:border-white/10"><p className="editorial-kicker">About this story</p><p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">Filed under {meta.label}. Published {format(new Date(frontmatter.publishDate), "MMM d, yyyy")}.</p>{frontmatter.tags?.length ? <div className="mt-5 flex flex-wrap gap-1.5">{frontmatter.tags.map((tag) => <span key={tag} className="border border-black/10 px-2 py-1 text-[9px] uppercase tracking-wider text-neutral-500 dark:border-white/15 dark:text-neutral-400">#{tag}</span>)}</div> : null}</div></aside>
    </div>

    {meta.hasTracks && frontmatter.tracks?.length ? <section className="border-y border-black/10 bg-black/[.02] py-10 dark:border-white/10 dark:bg-white/[.025]"><div className="container-editorial"><TrackTable tracks={frontmatter.tracks} title={meta.isSpotlight ? "Selected listening" : "Track list"} /></div></section> : null}

    {related.length > 0 && <section className="container-editorial py-12 sm:py-16"><div className="flex items-end justify-between border-b border-black/10 pb-3 dark:border-white/10"><div><p className="editorial-kicker">Keep reading</p><h2 className="mt-2 font-display text-3xl font-black uppercase tracking-[-.04em]">More from {meta.label}</h2></div><ArrowUpRight className="text-accent" size={24} /></div><div className="mt-6 grid gap-x-5 sm:grid-cols-3">{related.map((item) => <div key={item.frontmatter.slug}><Link href={`/${collection}/${item.frontmatter.slug}`} className="group"><div className="relative aspect-[3/2] overflow-hidden bg-neutral-200 dark:bg-neutral-800"><Image src={item.frontmatter.coverImage} alt={item.frontmatter.title} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-3 editorial-kicker">{item.frontmatter.category || meta.singularLabel}</p><h3 className="mt-1 font-display text-xl font-black leading-tight">{item.frontmatter.title}</h3></Link></div>)}</div></section>}
  </article>;
}
