import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COLLECTIONS, CollectionSlug } from "@/lib/types";
import { getCollectionEntries } from "@/lib/content";
import EditorialCard from "@/components/EditorialCard";
import ArticleListItem from "@/components/ArticleListItem";
import AnimatedSection from "@/components/AnimatedSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const { collection } = await params;
  const meta = COLLECTIONS[collection as CollectionSlug];
  if (!meta) return {};
  return { title: meta.label, description: meta.description, openGraph: { title: meta.label, description: meta.description } };
}

const LIST_STYLE: Record<CollectionSlug, "grid" | "list"> = {
  articles: "list", "monthly-reviews": "grid", "weekly-picks": "grid", playlists: "grid", "artist-spotlights": "list", "trend-reports": "list", "industry-insights": "list"
};

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ genre?: string; mood?: string; language?: string; month?: string; year?: string }> }) {
  const { collection: collectionParam } = await params;
  await searchParams;
  const collection = collectionParam as CollectionSlug;
  const meta = COLLECTIONS[collection];
  if (!meta) notFound();
  const entries = await getCollectionEntries(collection);
  const style = LIST_STYLE[collection];
  const lead = entries[0];
  const isPlaylist = collection === "playlists";

  return <div>
    <section className="border-b border-black/10">
      <div className="container-editorial py-12 sm:py-16">
        <AnimatedSection>
          <p className="editorial-kicker">The Sound Report · 2026</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.7fr_1fr] lg:items-end">
            <h1 className="max-w-5xl font-display text-[clamp(3.5rem,7vw,6.8rem)] font-black uppercase leading-[.82] tracking-[-.065em]">{meta.label}</h1>
            <p className="max-w-md text-sm leading-6 text-neutral-500">{meta.description}</p>
          </div>
        </AnimatedSection>
      </div>
    </section>

    <div className="container-editorial py-8 sm:py-10">
      {entries.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">No stories yet.</p>}
      {lead && style === "list" && <section className="mt-10 grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[1.55fr_.9fr]">
        <EditorialCard entry={lead} size="lg" badge="Lead story" />
        <div className="flex flex-col justify-center"><p className="editorial-kicker">In focus</p><h2 className="mt-3 font-display text-3xl font-black leading-[.95] sm:text-4xl">Stories that move the culture.</h2><p className="mt-4 text-sm leading-6 text-neutral-500">Reporting, ideas and context from across the Indian music landscape.</p></div>
      </section>}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between border-b border-black/10 pb-3"><h2 className="font-display text-2xl font-black uppercase tracking-[-.03em]">{style === "list" ? "Latest" : "Explore"}</h2><span className="editorial-meta">{entries.length} {isPlaylist ? (entries.length === 1 ? "playlist" : "playlists") : (entries.length === 1 ? "story" : "stories")}</span></div>
        {style === "grid" ? (
          <div className={isPlaylist ? "grid items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"}>
            {entries.map((entry, i) => (
              <AnimatedSection key={entry.frontmatter.slug} delay={Math.min(i * .04, .2)} className="h-full">
                <EditorialCard entry={entry} size={isPlaylist ? "md" : i === 0 ? "lg" : "md"} />
              </AnimatedSection>
            ))}
          </div>
        ) : <div>{entries.slice(lead ? 1 : 0).map((entry, i) => <AnimatedSection key={entry.frontmatter.slug} delay={Math.min(i * .03, .2)}><ArticleListItem entry={entry} /></AnimatedSection>)}</div>}
      </section>
    </div>
  </div>;
}
