"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SiteSettingsPage() {
  const [form, setForm] = useState({
    siteName: "The Sound Report",
    tagline: "Editorial insights into India's music landscape",
    founderName: "Sahil Siddiqui",
    seoDescription: "",
    seoImage: "/images/hero-crowd.jpg",
    contactEmail: "",
    contactPhone: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
      if (error) {
        setMessage(error.message);
      } else if (data) {
        const links = data.socials ?? {};
        setForm({
          siteName: data.site_name ?? "The Sound Report",
          tagline: data.tagline ?? "",
          founderName: data.founder_name ?? "",
          seoDescription: data.default_seo_description ?? "",
          seoImage: data.default_seo_image ?? "/images/hero-crowd.jpg",
          contactEmail: links.contactEmail ?? links.contact_email ?? "",
          contactPhone: links.contactPhone ?? links.contact_phone ?? ""
        });
      }
      setLoading(false);
    })();
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({
      id: true,
      site_name: form.siteName.trim(),
      tagline: form.tagline.trim(),
      founder_name: form.founderName.trim(),
      default_seo_description: form.seoDescription.trim(),
      default_seo_image: form.seoImage.trim(),
      socials: {
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim()
      },
      updated_at: new Date().toISOString()
    });

    setMessage(error ? error.message : "Site settings saved.");
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-neutral-50 p-8 dark:bg-[#0a0a0c]">Loading settings…</main>;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0c]">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Link href="/admin" className="text-sm font-semibold text-accent hover:underline">← Back to Editorial Desk</Link>
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">The Sound Report</p>
          <h1 className="mt-2 font-display text-4xl font-black">Site Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Update publication details and contact information without editing the website code.
          </p>
        </div>

        <form onSubmit={save} className="mt-8 space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[.04]">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Publication</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Publication name" value={form.siteName} onChange={(v) => update("siteName", v)} />
              <Field label="Founder / editor" value={form.founderName} onChange={(v) => update("founderName", v)} />
            </div>
            <div className="mt-5">
              <Field label="Tagline" value={form.tagline} onChange={(v) => update("tagline", v)} />
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[.04]">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">Contact</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Contact email" type="email" value={form.contactEmail} onChange={(v) => update("contactEmail", v)} placeholder="editor@thesoundreport.com" />
              <Field label="Contact phone" type="tel" value={form.contactPhone} onChange={(v) => update("contactPhone", v)} placeholder="+91 98765 43210" />
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[.04]">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-400">SEO</p>
            <div className="mt-5">
              <Field label="Default SEO description" value={form.seoDescription} onChange={(v) => update("seoDescription", v)} />
            </div>
            <div className="mt-5">
              <Field label="Default SEO image" value={form.seoImage} onChange={(v) => update("seoImage", v)} />
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving…" : "Save settings"}
            </button>
            {message && <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className="admin-input dark:text-neutral-100" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
