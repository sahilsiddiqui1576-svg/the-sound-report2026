import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";

export type SongRecord = {
  id: string;
  title: string;
  slug: string;
  album_title: string | null;
  release_date: string | null;
  language: string | null;
  region: string | null;
  genre: string | null;
  label: string | null;
  cover_image_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  amazon_music_url: string | null;
  youtube_url: string | null;
  editorial_note: string | null;
  artist: { id: string; name: string; slug: string } | null;
  score: number | null;
  rank: number | null;
  previous_rank: number | null;
  rank_change: number | null;
};

const EMPTY: SongRecord[] = [];

function normalizeSong(row: any): SongRecord {
  const artist = Array.isArray(row.artists) ? row.artists[0] : row.artists;
  const scoreRows = Array.isArray(row.song_scores) ? row.song_scores : row.song_scores ? [row.song_scores] : [];
  const score = [...scoreRows].sort((a, b) => String(b.score_date ?? "").localeCompare(String(a.score_date ?? "")))[0];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    album_title: row.album_title,
    release_date: row.release_date,
    language: row.language,
    region: row.region,
    genre: row.genre,
    label: row.label,
    cover_image_url: row.cover_image_url,
    spotify_url: row.spotify_url,
    apple_music_url: row.apple_music_url,
    amazon_music_url: row.amazon_music_url,
    youtube_url: row.youtube_url,
    editorial_note: row.editorial_note,
    artist: artist ? { id: artist.id, name: artist.name, slug: artist.slug } : null,
    score: score?.tsr_score ?? null,
    rank: score?.rank ?? null,
    previous_rank: score?.previous_rank ?? null,
    rank_change: score?.rank_change ?? null,
  };
}

export async function getSongs(filters?: { q?: string; language?: string; region?: string; genre?: string }) {
  if (!hasSupabase()) return EMPTY;
  const supabase = await createClient();
  let query = supabase
    .from("songs")
    .select("*, artists:artist_id(id,name,slug), song_scores(tsr_score,rank,previous_rank,rank_change,score_date,methodology_version)")
    .eq("is_active", true);

  if (filters?.language) query = query.eq("language", filters.language);
  if (filters?.region) query = query.eq("region", filters.region);
  if (filters?.genre) query = query.eq("genre", filters.genre);
  if (filters?.q) {
    const safe = filters.q.replace(/,/g, " ").trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,album_title.ilike.%${safe}%`);
  }

  const { data, error } = await query.order("release_date", { ascending: false }).limit(100);
  if (error || !data) return EMPTY;
  return data.map(normalizeSong).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}

export async function getSongBySlug(slug: string) {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*, artists:artist_id(id,name,slug), song_scores(tsr_score,rank,previous_rank,rank_change,score_date,methodology_version)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeSong(data);
}

export async function getSongFacets() {
  if (!hasSupabase()) return { languages: [], regions: [], genres: [] };
  const supabase = await createClient();
  const { data } = await supabase.from("songs").select("language,region,genre").eq("is_active", true).limit(5000);
  const unique = (values: (string | null)[]) => [...new Set(values.filter(Boolean) as string[])].sort();
  return {
    languages: unique(data?.map((x) => x.language) ?? []),
    regions: unique(data?.map((x) => x.region) ?? []),
    genres: unique(data?.map((x) => x.genre) ?? []),
  };
}
