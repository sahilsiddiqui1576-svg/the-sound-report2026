/**
 * Generates public/search-index.json from every collection's Markdown files.
 * Run automatically before `next build`.
 */

import fs from "fs";
import path from "path";
import { getAllEntries } from "../src/lib/content";

async function buildSearchIndex() {
  const entries = (await getAllEntries()).map((e) => ({
    title: e.frontmatter.title,
    slug: e.frontmatter.slug,
    collection: e.collection,
    excerpt: e.frontmatter.excerpt,
    tags: e.frontmatter.tags,
    genre: e.frontmatter.genre ?? [],
    mood: e.frontmatter.mood ?? [],
    language: e.frontmatter.language ?? [],
    month: e.frontmatter.month ?? "",
    year: e.frontmatter.year ?? null,
    coverImage: e.frontmatter.coverImage,
    publishDate: e.frontmatter.publishDate,
  }));

  const outPath = path.join(
    process.cwd(),
    "public",
    "search-index.json"
  );

  fs.writeFileSync(
    outPath,
    JSON.stringify(entries, null, 2)
  );

  console.log(
    `Search index written: ${entries.length} entries -> ${outPath}`
  );
}

buildSearchIndex().catch((error) => {
  console.error(error);
  process.exit(1);
});