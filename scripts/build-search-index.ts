import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const COLLECTIONS = [
  "articles",
  "monthly-reviews",
  "weekly-picks",
  "playlists",
  "artist-spotlights",
  "trend-reports",
  "industry-insights",
];

function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getMarkdownFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".md")
        ? [fullPath]
        : [];
    });
}

function buildSearchIndex() {
  const entries: any[] = [];

  for (const collection of COLLECTIONS) {
    const collectionDir = path.join(CONTENT_ROOT, collection);

    for (const filePath of getMarkdownFiles(collectionDir)) {
      const file = fs.readFileSync(filePath, "utf8");
      const { data } = matter(file);

      if (data.draft === true) continue;

      entries.push({
        title: data.title,
        slug: data.slug,
        collection,
        excerpt: data.excerpt,
        tags: data.tags ?? [],
        genre: data.genre ?? [],
        mood: data.mood ?? [],
        language: data.language ?? [],
        month: data.month ?? "",
        year: data.year ?? null,
        coverImage: data.coverImage,
        publishDate: data.publishDate,
      });
    }
  }

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

buildSearchIndex();