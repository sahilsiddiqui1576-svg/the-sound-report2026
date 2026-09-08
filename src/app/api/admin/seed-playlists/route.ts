import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@/lib/supabase/server";

const SLUGS = [
  "gold-picks",
  "desi-but-different",
  "across-the-border",
  "the-film-cut",
  "late-night-india",
  "whats-moving",
] as const;

function linksFor(title: string, artist: string) {
  const q = encodeURIComponent(`${title} ${artist}`);
  return {
    spotify: `https://open.spotify.com/search/${q}`,
    appleMusic: `https://music.apple.com/in/search?term=${q}`,
    amazonMusic: `https://music.amazon.in/search/${q}`,
    youtube: `https://www.youtube.com/results?search_query=${q}`,
  };
}

function readSeedRows() {
  const root = path.join(process.cwd(), "content", "playlists");
  return SLUGS.map((slug) => {
    const raw = fs.readFileSync(path.join(root, `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    const tracks = (data.tracks ?? []).map((track: any) => ({
      ...track,
      links: { ...linksFor(track.title, track.artist), ...(track.links ?? {}) },
    }));
    return {
      title: data.title,
      slug: data.slug,
      collection: "playlists",
      publish_date: data.publishDate,
      featured: Boolean(data.featured),
      draft: Boolean(data.draft),
      category: data.category,
      tags: data.tags ?? [],
      genre: data.genre ?? [],
      mood: data.mood ?? [],
      language: data.language ?? [],
      month: data.month ?? null,
      year: data.year ?? 2026,
      cover_image: data.coverImage || null,
      cover_image_alt: data.coverImageAlt || null,
      excerpt: data.excerpt || null,
      author: data.author || "The Sound Report Editors",
      display_order: data.order ?? null,
      curator: data.curator ?? "The Sound Report Editors",
      tracks,
      body: content.trim(),
      seo_title: data.seoTitle ?? data.title,
      seo_description: data.seoDescription ?? data.excerpt,
      seo_image: data.seoImage ?? null,
      canonical_url: data.canonicalUrl ?? null,
    };
  });
}

async function seed() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seeds = readSeedRows();
  const { data: existing, error: existingError } = await supabase
    .from("content_entries")
    .select("id,slug")
    .eq("collection", "playlists");
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  const curatedPresent = (existing ?? []).some((row: any) => SLUGS.includes(row.slug));
  if (curatedPresent) return NextResponse.json({ seeded: false, count: seeds.length, message: "Curated playlists already exist." });

  if ((existing ?? []).length) {
    const { error: deleteError } = await supabase.from("content_entries").delete().eq("collection", "playlists");
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("content_entries").insert(seeds);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ seeded: true, count: seeds.length });
}

export async function POST() { return seed(); }
export async function GET() { return seed(); }
