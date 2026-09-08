import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ContentEntry } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

interface Props { entry: ContentEntry; badge?: string; size?: "sm" | "md" | "lg"; }

export default function EditorialCard({ entry, badge, size = "md" }: Props) {
  const { frontmatter, collection } = entry;
  const href = `/${collection}/${frontmatter.slug}`;
  const aspect = size === "lg" ? "aspect-[4/3]" : size === "sm" ? "aspect-[5/4]" : "aspect-[3/2]";
  const label = frontmatter.category || (frontmatter.month ? `${frontmatter.month} ${frontmatter.year ?? ""}` : COLLECTIONS[collection].singularLabel);

  return (
    <Link href={href} className="group block">
      <div className={`relative ${aspect} overflow-hidden bg-neutral-200 dark:bg-neutral-800`}>
        <Image src={frontmatter.coverImage} alt={frontmatter.coverImageAlt || frontmatter.title} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        {badge && <span className="absolute left-4 top-4 bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-white">{badge}</span>}
      </div>
      <div className="border-b border-black/10 py-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <p className="editorial-kicker truncate">{label}</p>
          <span className="editorial-meta shrink-0">{format(new Date(frontmatter.publishDate), "MMM d, yyyy")}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-xl font-black leading-[1.02] tracking-[-.035em] sm:text-2xl">{frontmatter.title}</h3>
        {frontmatter.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400">{frontmatter.excerpt}</p>}
        <span className="link-arrow mt-3">Read story <span aria-hidden>↗</span></span>
      </div>
    </Link>
  );
}
