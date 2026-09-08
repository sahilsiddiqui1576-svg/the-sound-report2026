import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ContentEntry, COLLECTIONS } from "@/lib/types";

interface Props { entry: ContentEntry; badge?: string; size?: "sm" | "md" | "lg"; }

export default function EditorialCard({ entry, badge, size = "md" }: Props) {
  const { frontmatter, collection } = entry;
  const href = `/${collection}/${frontmatter.slug}`;
  const isPlaylist = collection === "playlists";
  const aspect = isPlaylist ? "aspect-[16/9]" : size === "lg" ? "aspect-[4/3]" : size === "sm" ? "aspect-[5/4]" : "aspect-[3/2]";
  const label = frontmatter.category || (frontmatter.month ? `${frontmatter.month} ${frontmatter.year ?? ""}` : COLLECTIONS[collection].singularLabel);

  return (
    <Link href={href} className="group block border-r border-black/10 last:border-r-0 dark:border-white/10">
      <div className={`relative w-full ${aspect} overflow-hidden bg-neutral-200 dark:bg-neutral-800`}>
        <Image src={frontmatter.coverImage} alt={frontmatter.coverImageAlt || frontmatter.title} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.02]" />
      </div>
      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="editorial-kicker truncate">{badge || label}</p>
          <span className="editorial-meta shrink-0">{format(new Date(frontmatter.publishDate), "MMM d")}</span>
        </div>
        <h3 className="mt-2 line-clamp-3 font-display text-xl font-black uppercase leading-[.94] tracking-[-.04em] sm:text-2xl">{frontmatter.title}</h3>
        {frontmatter.excerpt && <p className="mt-2 line-clamp-2 text-[11px] leading-[1.45] text-neutral-600 dark:text-neutral-400">{frontmatter.excerpt}</p>}
        <span className="link-arrow mt-4">Read story <span aria-hidden>↗</span></span>
      </div>
    </Link>
  );
}
