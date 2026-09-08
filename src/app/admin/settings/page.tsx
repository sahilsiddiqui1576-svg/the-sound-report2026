"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; title: string; slug: string; cover_image: string; collection: string };

type FormState = {
  siteName: string; tagline: string; founderName: string; seoDescription: string; seoImage: string; contactEmail: string; contactPhone: string;
  heroSlug: string; heroImage: string; playlistImage: string; latestHeading: string; latestSubheading: string; playlistHeading: string; playlistBody: string; newsletterHeading: string; newsletterBody: string;
};

const DEFAULTS: FormState = {
  siteName: "The Sound Report", tagline: "Editorial insights into India's music landscape", founderName: "Sahil Siddiqui", seoDescription: "", seoImage: "/images/hero-crowd.jpg", contactEmail: "", contactPhone: "",
  heroSlug: "", heroImage: "", playlistImage: "/images/about-hero.jpg", latestHeading: "More Music. Better Days.", latestSubheading: "The latest stories, ideas and sounds from The Sound Report.", playlistHeading: "Playlists for what's next", playlistBody: "Carefully curated playlists for every mood, moment and movement.", newsletterHeading: "Same people. New sounds.", newsletterBody: ""
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [articles, setArticles] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data, error }, { data: entries }] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
        supabase.from("content_entries").select("id,title,slug,cover_image,collection").in("collection", ["articles", "playlists"]).eq("draft", false).order("publish_date", { ascending: false })
      ]);
      if (error) setMessage(error.message);
      if (data) {
        const socials = data.socials ?? {};
        const hp = socials.homepage ?? {};
        setForm({
          ...DEFAULTS,
          siteName: data.site_name ?? DEFAULTS.siteName,
          tagline: data.tagline ?? DEFAULTS.tagline,
          founderName: data.founder_name ?? "",
          seoDescription: data.default_seo_description ?? "",
          seoImage: data.default_seo_image ?? DEFAULTS.seoImage,
          contactEmail: socials.contactEmail ?? socials.contact_email ?? "",
          contactPhone: socials.contactPhone ?? socials.contact_phone ?? "",
          heroSlug: hp.heroSlug ?? "",
          heroImage: hp.heroImage ?? "",
          playlistImage: hp.playlistImage ?? DEFAULTS.playlistImage,
          latestHeading: hp.latestHeading ?? DEFAULTS.latestHeading,
          latestSubheading: hp.latestSubheading ?? DEFAULTS.latestSubheading,
          playlistHeading: hp.playlistHeading ?? DEFAULTS.playlistHeading,
          playlistBody: hp.playlistBody ?? DEFAULTS.playlistBody,
          newsletterHeading: hp.newsletterHeading ?? DEFAULTS.newsletterHeading,
          newsletterBody: hp.newsletterBody ?? ""
        });
      }
      setArticles(entries ?? []);
      setLoading(false);
    })();
  }, []);

  function update(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: existing } = await supabase.from("site_settings").select("socials").eq("id", true).maybeSingle();
    const previousSocials = existing?.socials ?? {};
    const socials = {
      ...previousSocials,
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      homepage: {
        heroSlug: form.heroSlug.trim(), heroImage: form.heroImage.trim(), playlistImage: form.playlistImage.trim(), latestHeading: form.latestHeading.trim(), latestSubheading: form.latestSubheading.trim(), playlistHeading: form.playlistHeading.trim(), playlistBody: form.playlistBody.trim(), newsletterHeading: form.newsletterHeading.trim(), newsletterBody: form.newsletterBody.trim()
      }
    };
    const { error } = await supabase.from("site_settings").upsert({ id: true, site_name: form.siteName.trim(), tagline: form.tagline.trim(), founder_name: form.founderName.trim(), default_seo_description: form.seoDescription.trim(), default_seo_image: form.seoImage.trim(), socials, updated_at: new Date().toISOString() });
    setMessage(error ? error.message : "Site settings and homepage controls saved."); setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-[#f4f1ea] p-8">Loading settings…</main>;

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <Link href="/admin" className="text-sm font-semibold text-accent hover:underline">← Back to Editorial Desk</Link>
        <div className="mt-6"><p className="editorial-kicker">The Sound Report · Private</p><h1 className="mt-2 font-display text-5xl font-black uppercase leading-none tracking-[-.05em]">Site Settings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">Control publication details and the visual/content blocks that appear on the homepage.</p></div>

        <form onSubmit={save} className="mt-8 space-y-6">
          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">Publication</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Publication name" value={form.siteName} onChange={(v) => update("siteName", v)} /><Field label="Founder / editor" value={form.founderName} onChange={(v) => update("founderName", v)} /></div><div className="mt-5"><Field label="Tagline" value={form.tagline} onChange={(v) => update("tagline", v)} /></div></section>

          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">Homepage · Hero</p><p className="mt-2 text-sm text-neutral-500">Choose the article used as the hero story and optionally override its image with another local or public image path.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><SelectField label="Hero story" value={form.heroSlug} onChange={(v) => update("heroSlug", v)} options={articles.filter((x) => x.collection === "articles").map((x) => ({ value: x.slug, label: x.title }))} placeholder="Use featured article" /><Field label="Hero image override" value={form.heroImage} onChange={(v) => update("heroImage", v)} placeholder="/images/home/hero.jpg" /></div></section>

          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">Homepage · Sections</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Latest section heading" value={form.latestHeading} onChange={(v) => update("latestHeading", v)} /><Field label="Latest section subheading" value={form.latestSubheading} onChange={(v) => update("latestSubheading", v)} /><Field label="Playlist section heading" value={form.playlistHeading} onChange={(v) => update("playlistHeading", v)} /><Field label="Playlist section image" value={form.playlistImage} onChange={(v) => update("playlistImage", v)} placeholder="/images/home/playlists.jpg" /></div><div className="mt-5"><TextAreaField label="Playlist section copy" value={form.playlistBody} onChange={(v) => update("playlistBody", v)} /></div></section>

          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">Homepage · Newsletter</p><div className="mt-5"><Field label="Newsletter heading" value={form.newsletterHeading} onChange={(v) => update("newsletterHeading", v)} /></div><div className="mt-5"><TextAreaField label="Newsletter copy" value={form.newsletterBody} onChange={(v) => update("newsletterBody", v)} /></div></section>

          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">Contact</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Contact email" type="email" value={form.contactEmail} onChange={(v) => update("contactEmail", v)} /><Field label="Contact phone" type="tel" value={form.contactPhone} onChange={(v) => update("contactPhone", v)} /></div></section>

          <section className="border border-black/10 bg-white p-6 sm:p-8"><p className="editorial-kicker">SEO</p><div className="mt-5"><TextAreaField label="Default SEO description" value={form.seoDescription} onChange={(v) => update("seoDescription", v)} /></div><div className="mt-5"><Field label="Default SEO image" value={form.seoImage} onChange={(v) => update("seoImage", v)} /></div></section>

          <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={saving} className="bg-black px-7 py-3 text-xs font-bold uppercase tracking-[.12em] text-white transition hover:bg-accent disabled:opacity-50">{saving ? "Saving…" : "Save settings"}</button>{message && <p className="text-sm text-neutral-500">{message}</p>}</div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label className="block text-sm font-semibold">{label}<input className="admin-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-semibold">{label}<textarea className="admin-input min-h-[110px] resize-y" value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder: string }) { return <label className="block text-sm font-semibold">{label}<select className="admin-input" value={value} onChange={(e) => onChange(e.target.value)}><option value="">{placeholder}</option>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>; }
