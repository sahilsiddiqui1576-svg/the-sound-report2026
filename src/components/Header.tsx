"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#0a0a0c]/90">
      <div className="container-editorial flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteName} home`}>
          <WaveformLogo />
          <span>
            <span className="block font-display text-lg font-extrabold uppercase tracking-tight">{siteName}</span>
            <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">{tagline}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={`text-sm font-semibold transition hover:text-accent ${active ? "text-accent" : "text-neutral-700 dark:text-neutral-300"}`}>{item.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/15 lg:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-black/5 lg:hidden dark:border-white/10" aria-label="Mobile"><ul className="container-editorial flex flex-col gap-1 py-3">{NAV.map((item) => <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5">{item.label}</Link></li>)}</ul></nav>}
    </header>
  );
}
