import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@/lib/supabase/server";

const PLAYLIST_SLUGS = [
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

function readPlaylistSeeds() {
  const root = path.join(process.cwd(), "content", "playlists");
  return PLAYLIST_SLUGS.map((slug) => {
    const raw = fs.readFileSync(path.join(root, `${slug}.md`), "utf8");
    const { data, content } = matter(raw) as any;
    const tracks = (data.tracks ?? []).map((track: any) => ({
      ...track,
      links: { ...linksFor(track.title, track.artist), ...(track.links ?? {}) },
    }));
    return {
      title: data.title,
      slug: data.slug,
      collection: "playlists",
      publish_date: data.publishDate,
      updated_date: data.updatedDate || null,
      featured: Boolean(data.featured),
      draft: Boolean(data.draft),
      category: data.category || "",
      tags: data.tags || [],
      genre: data.genre || [],
      mood: data.mood || [],
      language: data.language || [],
      month: data.month || null,
      year: data.year || 2026,
      cover_image: data.coverImage || "",
      cover_image_alt: data.coverImageAlt || null,
      excerpt: data.excerpt || "",
      author: data.author || "The Sound Report Editors",
      display_order: data.order ?? null,
      curator: data.curator || "The Sound Report Editors",
      tracks,
      body: content.trim(),
      seo_title: data.seoTitle || data.title,
      seo_description: data.seoDescription || data.excerpt,
      seo_image: data.seoImage || null,
      canonical_url: data.canonicalUrl || null,
    };
  });
}

async function authed() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  return { s, user };
}

export async function GET(req: Request) {
  const { s, user } = await authed();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const collection = new URL(req.url).searchParams.get("collection");
  let q = s.from("content_entries").select("*").order("display_order", { ascending: true, nullsFirst: false }).order("publish_date", { ascending: false });
  if (collection) q = q.eq("collection", collection);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Playlists are bundled editorial content. If the database has not been seeded yet,
  // automatically import the six final playlists the first time the admin opens them.
  if (collection === "playlists" && (!data || data.length === 0)) {
    const seeds = readPlaylistSeeds();
    const { data: inserted, error: insertError } = await s
      .from("content_entries")
      .insert(seeds)
      .select("*");
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json(inserted || []);
  }

  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const { s, user } = await authed();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await s.from("content_entries").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
