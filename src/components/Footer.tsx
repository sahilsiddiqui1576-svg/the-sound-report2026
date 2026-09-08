import Link from "next/link";
import WaveformLogo from "./WaveformLogo";

interface FooterProps {
  siteName: string;
  tagline: string;
  founderName: string;
  contactEmail?: string;
  contactPhone?: string;
}

const LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/artist-spotlights", label: "Artists" },
  { href: "/trend-reports", label: "Trends" },
  { href: "/playlists", label: "Playlists" },
  { href: "/about", label: "About" },
];

export default function Footer({ siteName, tagline, founderName, contactEmail, contactPhone }: FooterProps) {
  return (
    <footer className="border-t border-black/5 bg-paper dark:border-white/10 dark:bg-[#0a0a0c]">
      <div className="container-editorial flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <WaveformLogo size={22} />
            <span className="font-display text-base font-extrabold uppercase">{siteName}</span>
          </Link>
          <p className="mt-3 max-w-md text-sm text-neutral-500 dark:text-neutral-400">{tagline}</p>
          <p className="mt-2 text-xs text-neutral-400">An independent music publication.</p>
        </div>
        <div className="flex flex-col gap-5 md:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {LINKS.map((link) => <Link key={link.href} href={link.href} className="text-sm font-semibold hover:text-accent">{link.label}</Link>)}
          </nav>
          {(contactEmail || contactPhone) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="font-semibold hover:text-accent">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone.replace(/[^+\d]/g, "")}`} className="font-semibold hover:text-accent">
                  {contactPhone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-black/5 py-5 dark:border-white/10">
        <div className="container-editorial flex flex-col gap-1 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Founded and edited by {founderName}</p>
        </div>
      </div>
    </footer>
  );
}
