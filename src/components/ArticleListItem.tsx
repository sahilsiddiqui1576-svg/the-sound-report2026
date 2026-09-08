import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ContentEntry, COLLECTIONS } from "@/lib/types";

export default function ArticleListItem({ entry }: { entry: ContentEntry }) {
  const { frontmatter, collection } = entry;
  const href = `/${collection}/${frontmatter.slug}`;
  return (
    <Link href={href} className="group grid grid-cols-[84px_1fr_28px] items-center gap-4 border-t border-black/10 py-4 transition hover:bg-black/[.025] dark:border-white/10 dark:hover:bg-white/[.025] sm:grid-cols-[150px_1fr_34px] sm:gap-6">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Image src={frontmatter.artistImage || frontmatter.coverImage} alt={frontmatter.coverImageAlt || frontmatter.title} fill sizes="150px" className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
      </div>
      <div className="min-w-0">
        <p className="editorial-kicker">{frontmatter.category || COLLECTIONS[collection].singularLabel}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-black uppercase leading-[.95] tracking-[-.035em] sm:text-2xl">{frontmatter.title}</h3>
        {frontmatter.excerpt && <p className="mt-1 hidden line-clamp-1 text-[11px] leading-5 text-neutral-500 dark:text-neutral-400 sm:block">{frontmatter.excerpt}</p>}
        <p className="mt-2 editorial-meta">{format(new Date(frontmatter.publishDate), "MMM d, yyyy")} · {entry.readingTimeMinutes} min read</p>
      </div>
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-xs transition group-hover:border-accent group-hover:text-accent dark:border-white/15" aria-hidden>→</span>
    </Link>
  );
}
