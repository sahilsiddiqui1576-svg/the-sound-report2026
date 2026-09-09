import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { createClient } from "./supabase/server";
import { hasSupabase } from "./supabase/env";
import { BaseFrontmatter, COLLECTIONS, CollectionSlug, ContentEntry } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readCollectionDir(collection: CollectionSlug): string[] {
  const dir = path.join(CONTENT_ROOT, COLLECTIONS[collection].dir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function trackLinks(title: string, artist: string) {
  const q = encodeURIComponent(`${title} ${artist}`);
  return { spotify: `https://open.spotify.com/search/${q}`, appleMusic: `https://music.apple.com/in/search?term=${q}`, amazonMusic: `https://music.amazon.in/search/${q}`, youtube: `https://www.youtube.com/results?search_query=${q}` };
}

function normalizeTracks(tracks: any[] | undefined) {
  return (tracks ?? []).map((track) => ({ ...track, links: { ...trackLinks(track.title, track.artist), ...(track.links ?? {}) } }));
}

function markdownEntries(collection: CollectionSlug): ContentEntry[] {
  return readCollectionDir(collection).map((filename) => {
    const filePath = path.join(CONTENT_ROOT, COLLECTIONS[collection].dir, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = { ...(data as BaseFrontmatter), ...(collection === "playlists" ? { tracks: normalizeTracks((data as BaseFrontmatter).tracks) } : {}) } as BaseFrontmatter;
    return { frontmatter, body: content, collection, readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)) } satisfies ContentEntry;
  }).filter((e) => process.env.NODE_ENV === "development" || !e.frontmatter.draft)
    .sort((a,b) => (a.frontmatter.order ?? Number.MAX_SAFE_INTEGER) - (b.frontmatter.order ?? Number.MAX_SAFE_INTEGER) || new Date(b.frontmatter.publishDate).getTime() - new Date(a.frontmatter.publishDate).getTime());
}

function rowToEntry(row: any): ContentEntry {
  const frontmatter: BaseFrontmatter = {
    title: row.title, slug: row.slug, publishDate: row.publish_date, updatedDate: row.updated_date, featured: row.featured, draft: row.draft, category: row.category, tags: row.tags ?? [], genre: row.genre ?? [], mood: row.mood ?? [], language: row.language ?? [], month: row.month, year: row.year,
    coverImage: row.cover_image, coverImageAlt: row.cover_image_alt, excerpt: row.excerpt, author: row.author, order: row.display_order, artistName: row.artist_name, artistImage: row.artist_image, location: row.location, country: row.country, artistLinks: row.artist_links ?? {}, curator: row.curator,
    spotifyUrl: row.spotify_url, appleMusicUrl: row.apple_music_url, youtubeUrl: row.youtube_url, weekLabel: row.week_label, researchNotes: row.research_notes, tracks: row.tracks ?? [], seoTitle: row.seo_title, seoDescription: row.seo_description, seoImage: row.seo_image, canonicalUrl: row.canonical_url
  };
  return { frontmatter, body: row.body ?? "", collection: row.collection as CollectionSlug, readingTimeMinutes: Math.max(1, Math.ceil(readingTime(row.body ?? "").minutes)) };
}

export async function getCollectionEntries(collection: CollectionSlug): Promise<ContentEntry[]> {
  if (collection === "playlists") return markdownEntries(collection);
  if (!hasSupabase()) return markdownEntries(collection);
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_entries").select("*").eq("collection", collection).order("display_order", { ascending: true, nullsFirst: false }).order("publish_date", { ascending: false });
  if (error || !data) return markdownEntries(collection);

  const dbEntries = data.filter((r) => process.env.NODE_ENV === "development" || !r.draft).map(rowToEntry);

  // Trend reports are editorially authored in the repository. Merge matching database
  // edits over the markdown source, but only expose the current markdown slugs. This
  // lets new reports appear immediately while retired reports disappear cleanly.
  if (collection === "trend-reports") {
    const mdEntries = markdownEntries(collection);
    const bySlug = new Map(dbEntries.map((entry) => [entry.frontmatter.slug, entry]));
    return mdEntries
      .map((entry) => bySlug.get(entry.frontmatter.slug) ?? entry)
      .sort((a,b) => (a.frontmatter.order ?? Number.MAX_SAFE_INTEGER) - (b.frontmatter.order ?? Number.MAX_SAFE_INTEGER) || new Date(b.frontmatter.publishDate).getTime() - new Date(a.frontmatter.publishDate).getTime());
  }

  return dbEntries;
}

export async function getAllEntries(): Promise<ContentEntry[]> {
  const result = (await Promise.all((Object.keys(COLLECTIONS) as CollectionSlug[]).map(getCollectionEntries))).flat();
  return result.sort((a,b) => new Date(b.frontmatter.publishDate).getTime() - new Date(a.frontmatter.publishDate).getTime());
}

export async function getEntryBySlug(collection: CollectionSlug, slug: string): Promise<ContentEntry | undefined> {
  if (collection === "playlists") return markdownEntries(collection).find((e) => e.frontmatter.slug === slug);
  if (!hasSupabase()) return markdownEntries(collection).find((e) => e.frontmatter.slug === slug);
  const supabase = await createClient();

  if (collection === "trend-reports") {
    const markdownEntry = markdownEntries(collection).find((e) => e.frontmatter.slug === slug);
    if (!markdownEntry) return undefined;
    const { data, error } = await supabase.from("content_entries").select("*").eq("collection", collection).eq("slug", slug).maybeSingle();
    if (!error && data && (process.env.NODE_ENV === "development" || !data.draft)) return rowToEntry(data);
    return markdownEntry;
  }

  const { data, error } = await supabase.from("content_entries").select("*").eq("collection", collection).eq("slug", slug).maybeSingle();
  if (error || !data || (process.env.NODE_ENV !== "development" && data.draft)) return undefined;
  return rowToEntry(data);
}

export async function getFeaturedEntries(limit = 6): Promise<ContentEntry[]> { return (await getAllEntries()).filter((e) => e.frontmatter.featured).slice(0, limit); }
export async function getLatestEntries(limit = 8): Promise<ContentEntry[]> { return (await getAllEntries()).slice(0, limit); }

export async function getFacets() {
  const all = await getAllEntries();
  const uniq = (arr: (string | undefined)[]) => Array.from(new Set(arr.filter(Boolean))) as string[];
  return { genres: uniq(all.flatMap(e => e.frontmatter.genre ?? [])).sort(), moods: uniq(all.flatMap(e => e.frontmatter.mood ?? [])).sort(), languages: uniq(all.flatMap(e => e.frontmatter.language ?? [])).sort(), months: uniq(all.map(e => e.frontmatter.month)).sort(), years: uniq(all.map(e => String(e.frontmatter.year ?? ""))).sort().reverse(), categories: uniq(all.map(e => e.frontmatter.category)).sort() };
}

export async function readSingletonPage(slug: "about" | "contact") {
  const filePath = path.join(CONTENT_ROOT, "pages", `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, body: content };
}

export async function getEntryByFilePath(refPath?: string): Promise<ContentEntry | undefined> {
  if (!refPath) return undefined;
  if (hasSupabase()) {
    const match = refPath.match(/content\/([^/]+)\/([^/]+)\.mdx?$/);
    if (match) return getEntryBySlug(match[1] as CollectionSlug, match[2]);
  }
  const absPath = path.join(process.cwd(), refPath.replace(/^\/+/, ""));
  if (!fs.existsSync(absPath)) return undefined;
  const collectionDir = path.basename(path.dirname(absPath));
  const collection = (Object.keys(COLLECTIONS) as CollectionSlug[]).find(c => COLLECTIONS[c].dir === collectionDir);
  if (!collection) return undefined;
  const raw = fs.readFileSync(absPath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as BaseFrontmatter;
  if (process.env.NODE_ENV !== "development" && frontmatter.draft) return undefined;
  return { frontmatter, body: content, collection, readingTimeMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)) };
}

export interface HomepageConfig { heroArticle?: string; featuredArticles?: { article?: string }[]; featuredArtist?: string; featuredPlaylist?: string; weeklyPick?: string; monthlyReview?: string; trendReport?: string; industryInsight?: string; newsletterHeading?: string; newsletterBody?: string; }

export async function readHomepageConfig(): Promise<HomepageConfig> {
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data } = await supabase.from("homepage_settings").select("*").eq("id", true).maybeSingle();
    if (data) {
      const ids = [data.hero_entry_id, ...(data.featured_entry_ids ?? [])].filter(Boolean);
      const map = new Map<string, string>();
      if (ids.length) { const { data: entries } = await supabase.from("content_entries").select("id,collection,slug").in("id", ids); entries?.forEach((e:any) => map.set(e.id, `content/${e.collection}/${e.slug}.md`)); }
      const resolve = (id?: string) => id ? map.get(id) : undefined;
      return { heroArticle: resolve(data.hero_entry_id), featuredArticles: (data.featured_entry_ids ?? []).map((id:string) => ({ article: resolve(id) })).filter((x: { article?: string }) => x.article), featuredArtist: resolve(data.featured_artist_id), featuredPlaylist: resolve(data.featured_playlist_id), weeklyPick: resolve(data.weekly_pick_id), monthlyReview: resolve(data.monthly_review_id), trendReport: resolve(data.trend_report_id), industryInsight: resolve(data.industry_insight_id), newsletterHeading: data.newsletter_heading ?? undefined, newsletterBody: data.newsletter_body ?? undefined };
    }
  }
  const filePath = path.join(CONTENT_ROOT, "settings", "homepage.md");
  if (!fs.existsSync(filePath)) return {};
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  return data as HomepageConfig;
}

export async function readSiteSettings() {
  const emptyContact = { contactEmail: "", contactPhone: "" };
  if (hasSupabase()) {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
    if (data) {
      const socials = data.socials ?? {};
      return {
        siteName: data.site_name,
        tagline: data.tagline,
        founderName: data.founder_name,
        defaultSeoDescription: data.default_seo_description,
        defaultSeoImage: data.default_seo_image,
        socials,
        homepage: socials.homepage ?? {},
        contactEmail: socials.contactEmail ?? socials.contact_email ?? emptyContact.contactEmail,
        contactPhone: socials.contactPhone ?? socials.contact_phone ?? emptyContact.contactPhone
      };
    }
  }
  const filePath = path.join(CONTENT_ROOT, "settings", "site.md");
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  return { siteName: data.siteName, tagline: data.tagline, founderName: data.founderName, defaultSeoDescription: data.defaultSeoDescription, defaultSeoImage: data.defaultSeoImage, socials: data.socials ?? {}, homepage: data.homepage ?? data.socials?.homepage ?? {}, contactEmail: data.contactEmail ?? emptyContact.contactEmail, contactPhone: data.contactPhone ?? emptyContact.contactPhone };
}