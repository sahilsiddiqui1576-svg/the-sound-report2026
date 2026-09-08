import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ContentEntry, COLLECTIONS } from "@/lib/types";

export default function ArticleListItem({ entry }: { entry: ContentEntry }) {
  const { frontmatter, collection } = entry;
  const href = `/${collection}/${frontmatter.slug}`;
  return (
    <Link href={href} className="group grid grid-cols-[96px_1fr_auto] items-center gap-4 border-t border-black/10 py-4 transition hover:bg-black/[.025] dark:border-white/10 dark:hover:bg-white/[.025] sm:grid-cols-[150px_1fr_auto] sm:gap-6">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Image src={frontmatter.artistImage || frontmatter.coverImage} alt={frontmatter.coverImageAlt || frontmatter.title} fill sizes="150px" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0">
        <p className="editorial-kicker">{frontmatter.category || COLLECTIONS[collection].singularLabel}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-black leading-[1.05] tracking-[-.025em] sm:text-2xl">{frontmatter.title}</h3>
        {frontmatter.excerpt && <p className="mt-1 hidden line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400 sm:block">{frontmatter.excerpt}</p>}
        <p className="mt-2 editorial-meta">{format(new Date(frontmatter.publishDate), "MMM d, yyyy")} · {entry.readingTimeMinutes} min read</p>
      </div>
      <span className="hidden h-9 w-9 items-center justify-center border border-black/10 text-lg transition group-hover:border-accent group-hover:text-accent dark:border-white/15 sm:flex" aria-hidden>↗</span>
    </Link>
  );
}
