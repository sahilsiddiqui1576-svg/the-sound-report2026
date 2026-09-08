import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { readSiteSettings } from "@/lib/content";
import ContactForm from "@/components/ContactForm";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with The Sound Report editorial team." };

export default async function ContactPage() {
  const settings = await readSiteSettings();
  return <div>
    <section className="border-b border-black/10 dark:border-white/10"><div className="container-editorial py-16 sm:py-24"><AnimatedSection><p className="editorial-kicker">The Sound Report · Contact</p><h1 className="mt-4 max-w-4xl font-display text-[clamp(4rem,9vw,8rem)] font-black uppercase leading-[.82] tracking-[-.065em]">Let&apos;s<br /><span className="text-accent">talk.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-neutral-500 dark:text-neutral-400">Story ideas, artist recommendations, corrections, partnerships or just something we should be listening to.</p></AnimatedSection></div></section>
    <section className="container-editorial grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.4fr_.8fr]">
      <AnimatedSection><div className="border-t border-black/10 pt-5 dark:border-white/10"><p className="editorial-kicker">Send a message</p><div className="mt-6"><ContactForm /></div></div></AnimatedSection>
      <AnimatedSection delay={.08}><div className="border-t border-black/10 pt-5 dark:border-white/10"><p className="editorial-kicker">Editorial desk</p><div className="mt-6 space-y-4"><ContactRow icon={Mail} label={settings.contactEmail || "Email not configured"} href={settings.contactEmail ? `mailto:${settings.contactEmail}` : undefined} /><ContactRow icon={Phone} label={settings.contactPhone || "Phone not configured"} href={settings.contactPhone ? `tel:${settings.contactPhone.replace(/[^+\d]/g, "")}` : undefined} /><ContactRow icon={MapPin} label="Based in India · Reporting worldwide" /></div></div></AnimatedSection>
    </section>
  </div>;
}

function ContactRow({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href?: string }) {
  const content = <span className="flex items-center gap-3"><Icon className="text-accent" size={17} aria-hidden /><span className="break-all">{label}</span></span>;
  return <div className="border-b border-black/10 pb-4 dark:border-white/10">{href ? <a href={href} className="text-sm font-semibold transition hover:text-accent">{content}</a> : <span className="text-sm text-neutral-500 dark:text-neutral-400">{content}</span>}</div>;
}
