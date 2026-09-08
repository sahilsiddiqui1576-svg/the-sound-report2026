"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { COLLECTIONS } from "@/lib/types";

const EDITORIAL = ["articles", "artist-spotlights", "trend-reports", "playlists"] as const;
type EditorialCollection = typeof EDITORIAL[number];
type Row = any;

const blank = { title: "", slug: "", publish_date: new Date().toISOString(), featured: false, draft: true, category: "", tags: [], genre: [], language: [], month: "", year: new Date().getFullYear(), cover_image: "", cover_image_alt: "", excerpt: "", author: "", display_order: null, artist_name: "", artist_image: "", location: "", artist_links: {}, curator: "", spotify_url: "", apple_music_url: "", youtube_url: "", research_notes: "", tracks: [], body: "", seo_title: "", seo_description: "", seo_image: "", canonical_url: "" };

export default function AdminCollection() {
  const { collection } = useParams<{ collection: string }>();
  const router = useRouter();
  const valid = EDITORIAL.includes(collection as EditorialCollection);
  const meta = valid ? COLLECTIONS[collection as EditorialCollection] : null;
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/admin/content?collection=${collection}`);
    if (response.status === 401) { router.push("/admin/login"); return; }
    setRows(await response.json()); setLoading(false);
  }
  useEffect(() => { if (valid) load(); }, [collection, valid]);
  if (!meta) return <main className="p-10">Unknown editorial section.</main>;

  async function save() {
    if (!editing) return;
    setSaving(true); setMessage("");
    const payload = { ...editing, collection, slug: editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
    const response = editing.id ? await fetch(`/api/admin/content/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Could not save."); else { setMessage("Saved."); setEditing(data); await load(); }
    setSaving(false);
  }
  async function remove(id: string) { if (!confirm("Delete this content permanently?")) return; const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" }); if (response.ok) load(); }
  async function upload(file: File) { const form = new FormData(); form.append("file", file); const response = await fetch("/api/admin/upload", { method: "POST", body: form }); const data = await response.json(); if (response.ok) setEditing((x: Row) => ({ ...x, cover_image: data.url })); else setMessage(data.error || "Upload failed."); }

  const isArtist = collection === "artist-spotlights";
  const isPlaylist = collection === "playlists";

  return <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0c]"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin" className="text-xs font-semibold text-neutral-500">← Editorial Desk</Link><h1 className="mt-2 font-display text-4xl font-black">{isArtist ? "Artists" : meta.label}</h1></div><button onClick={() => setEditing({ ...blank })} className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">+ Add {isArtist ? "Artist" : meta.singularLabel}</button></div>
    <div className="mt-8 grid gap-3">{loading ? <p className="text-sm text-neutral-500">Loading…</p> : rows.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-neutral-500">No content yet. Add your first {isArtist ? "artist spotlight" : meta.singularLabel.toLowerCase()}.</p> : rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/[.04]"><div className="min-w-0"><p className="truncate font-semibold">{row.title}</p><p className="mt-1 text-xs text-neutral-500">{row.draft ? "Draft" : "Published"} · {row.slug}</p></div><div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-lg border px-3 py-2 text-xs">Edit</button><button onClick={() => remove(row.id)} className="rounded-lg border px-3 py-2 text-xs text-red-600">Delete</button></div></div>)}</div>
    {editing && <Editor value={editing} setValue={setEditing} onSave={save} onCancel={() => setEditing(null)} onUpload={upload} saving={saving} message={message} isArtist={isArtist} isPlaylist={isPlaylist} />}
  </div></main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-semibold">{label}<div className="mt-1.5">{children}</div></label>; }
function Input(props: any) { return <input {...props} className="admin-input" />; }
function Textarea(props: any) { return <textarea {...props} className="admin-input min-h-28" />; }

function Editor({ value, setValue, onSave, onCancel, onUpload, saving, message, isArtist, isPlaylist }: { value: Row; setValue: any; onSave: () => void; onCancel: () => void; onUpload: (file: File) => void; saving: boolean; message: string; isArtist: boolean; isPlaylist: boolean }) {
  const set = (key: string, val: any) => setValue((current: Row) => ({ ...current, [key]: val }));
  const arr = (key: string) => Array.isArray(value[key]) ? value[key].join(", ") : "";
  const tracks = Array.isArray(value.tracks) ? value.tracks : [];
  function setTrack(index: number, key: string, val: any) { set("tracks", tracks.map((track: Row, i: number) => i === index ? { ...track, [key]: val } : track)); }
  function addTrack() { set("tracks", [...tracks, { title: "", artist: "", links: { spotify: "", appleMusic: "", youtube: "" } }]); }
  function removeTrack(index: number) { set("tracks", tracks.filter((_: Row, i: number) => i !== index)); }

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"><div className="mx-auto my-8 max-w-4xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111114] sm:p-8">
    <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Editorial entry</p><h2 className="mt-1 font-display text-2xl font-black">{value.id ? "Edit" : "Add"} content</h2></div><button onClick={onCancel} aria-label="Close">✕</button></div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <Field label="Title"><Input value={value.title} onChange={(e: any) => set("title", e.target.value)} /></Field>
      <Field label="Slug"><Input value={value.slug} onChange={(e: any) => set("slug", e.target.value)} placeholder="auto-generated if blank" /></Field>
      <Field label="Category"><Input value={value.category || ""} onChange={(e: any) => set("category", e.target.value)} /></Field>
      <Field label="Author"><Input value={value.author || ""} onChange={(e: any) => set("author", e.target.value)} /></Field>
      <Field label="Publish date"><Input type="datetime-local" value={value.publish_date ? new Date(value.publish_date).toISOString().slice(0, 16) : ""} onChange={(e: any) => set("publish_date", new Date(e.target.value).toISOString())} /></Field>
      <Field label="Month / issue"><Input value={value.month || ""} onChange={(e: any) => set("month", e.target.value)} placeholder="September 2026" /></Field>
      <Field label="Tags"><Input value={arr("tags")} onChange={(e: any) => set("tags", e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))} /></Field>
      <Field label="Genres"><Input value={arr("genre")} onChange={(e: any) => set("genre", e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))} /></Field>
      <div className="sm:col-span-2"><Field label="Short description"><Textarea value={value.excerpt || ""} onChange={(e: any) => set("excerpt", e.target.value)} /></Field></div>
      <div className="sm:col-span-2"><Field label="Cover image"><div className="flex gap-2"><Input value={value.cover_image || ""} onChange={(e: any) => set("cover_image", e.target.value)} /><label className="shrink-0 cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold"><input type="file" accept="image/*" className="hidden" onChange={(e: any) => e.target.files?.[0] && onUpload(e.target.files[0])} />Upload image</label></div></Field></div>
      {isArtist && <><Field label="Artist name"><Input value={value.artist_name || ""} onChange={(e: any) => set("artist_name", e.target.value)} /></Field><Field label="Location"><Input value={value.location || ""} onChange={(e: any) => set("location", e.target.value)} /></Field><Field label="Artist image URL"><Input value={value.artist_image || ""} onChange={(e: any) => set("artist_image", e.target.value)} /></Field><Field label="Artist website / social"><Input value={value.artist_links?.website || ""} onChange={(e: any) => set("artist_links", { ...(value.artist_links || {}), website: e.target.value })} /></Field></>}
      <div className="sm:col-span-2"><Field label="Editorial content (Markdown supported)"><Textarea className="min-h-[360px]" value={value.body || ""} onChange={(e: any) => set("body", e.target.value)} /></Field></div>
      {isPlaylist && <div className="sm:col-span-2 rounded-2xl border p-5"><div className="flex items-center justify-between gap-4"><div><h3 className="font-display text-lg font-black">Playlist songs</h3><p className="mt-1 text-xs text-neutral-500">Add songs manually. No Spotify integration or JSON required.</p></div><button type="button" onClick={addTrack} className="rounded-full border px-4 py-2 text-xs font-bold">+ Add song</button></div><div className="mt-5 space-y-4">{tracks.map((track: Row, index: number) => <div key={index} className="rounded-xl border p-4"><div className="grid gap-3 sm:grid-cols-2"><Input value={track.title || ""} placeholder="Song name" onChange={(e: any) => setTrack(index, "title", e.target.value)} /><Input value={track.artist || ""} placeholder="Artist" onChange={(e: any) => setTrack(index, "artist", e.target.value)} /><Input value={track.links?.spotify || ""} placeholder="Spotify link" onChange={(e: any) => setTrack(index, "links", { ...(track.links || {}), spotify: e.target.value })} /><Input value={track.links?.appleMusic || ""} placeholder="Apple Music link" onChange={(e: any) => setTrack(index, "links", { ...(track.links || {}), appleMusic: e.target.value })} /><Input value={track.links?.youtube || ""} placeholder="YouTube link" onChange={(e: any) => setTrack(index, "links", { ...(track.links || {}), youtube: e.target.value })} /><button type="button" onClick={() => removeTrack(index)} className="rounded-lg border px-3 py-2 text-xs text-red-600">Remove song</button></div></div>)}{!tracks.length && <p className="rounded-xl bg-black/[.03] p-4 text-center text-xs text-neutral-500 dark:bg-white/[.04]">No songs added yet.</p>}</div></div>}
      <div className="sm:col-span-2 flex flex-wrap gap-6 rounded-2xl border p-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!value.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!value.draft} onChange={(e) => set("draft", e.target.checked)} /> Draft</label></div>
    </div>
    <div className="mt-6 flex items-center justify-between gap-4"><span className="text-sm text-neutral-500">{message}</span><div className="flex gap-2"><button onClick={onCancel} className="rounded-xl border px-5 py-3 text-sm">Cancel</button><button disabled={saving} onClick={onSave} className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black">{saving ? "Saving…" : "Save"}</button></div></div>
  </div></div>;
}
