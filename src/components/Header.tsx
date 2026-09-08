"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import WaveformLogo from "./WaveformLogo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/artist-spotlights", label: "Artists" },
  { href: "/trend-reports", label: "Trends" },
  { href: "/playlists", label: "Playlists" },
  { href: "/about", label: "About" },
];

export default function Header({ siteName, tagline }: { siteName: string; tagline: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-paper/95 dark:border-white/10 dark:bg-[#0a0a0c]/95">
      <div className="container-editorial flex min-h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${siteName} home`}>
          <WaveformLogo size={25} />
          <span className="min-w-0">
            <span className="block truncate font-display text-xl font-black uppercase leading-none tracking-[-.04em] sm:text-2xl">{siteName}</span>
            <span className="mt-1 hidden max-w-[280px] truncate text-[9px] font-semibold uppercase tracking-[.18em] text-neutral-400 sm:block">{tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={`relative py-3 text-[11px] font-bold uppercase tracking-[.1em] transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:text-accent hover:after:w-full ${active ? "text-accent after:w-full" : "text-neutral-700 dark:text-neutral-300"}`}>{item.label}</Link>;
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/search" aria-label="Search" className="hidden h-9 w-9 items-center justify-center border border-black/10 transition hover:border-accent hover:text-accent dark:border-white/15 sm:flex"><Search size={16} /></Link>
          <ThemeToggle />
          <button type="button" className="flex h-9 w-9 items-center justify-center border border-black/10 dark:border-white/15 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X size={17} /> : <Menu size={17} />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-black/10 bg-paper dark:border-white/10 dark:bg-[#0a0a0c] lg:hidden" aria-label="Mobile">
          <ul className="container-editorial grid grid-cols-2 gap-px py-3">
            {NAV.map((item) => <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className="block px-2 py-3 text-xs font-bold uppercase tracking-[.12em] hover:text-accent">{item.label}</Link></li>)}
            <li><Link href="/search" onClick={() => setOpen(false)} className="block px-2 py-3 text-xs font-bold uppercase tracking-[.12em] hover:text-accent">Search</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
