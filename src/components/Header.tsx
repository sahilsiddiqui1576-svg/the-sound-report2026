"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/artist-spotlights", label: "Artists" },
  { href: "/monthly-reviews", label: "Reviews" },
  { href: "/playlists", label: "Playlists" },
  { href: "/about", label: "About" },
];

export default function Header({ siteName }: { siteName: string; tagline: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f3ee]/95 backdrop-blur-sm">
      <div className="container-editorial grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-5">
        <Link href="/" aria-label={`${siteName} home`} className="leading-none">
          <span className="block font-display text-[22px] font-black uppercase leading-[.78] tracking-[-.08em] sm:text-[26px]">The<br />Sound<br />Report</span>
        </Link>

        <nav className="hidden items-center justify-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`text-[9px] font-bold uppercase tracking-[.05em] transition ${active ? "text-accent" : "text-black"} hover:text-accent`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link href="/search" aria-label="Search" className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 hover:text-accent">
            <Search size={16} strokeWidth={1.7} />
          </Link>
          <Link href="/#newsletter" className="hidden rounded-full bg-black px-4 py-2 text-[9px] font-bold text-white transition hover:bg-accent sm:inline-flex">Subscribe</Link>
          <span className="hidden max-w-[88px] text-right text-[7px] font-bold uppercase leading-[1.25] tracking-[.08em] sm:block">Music<br />People<br />Culture<br />A louder tomorrow</span>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-black/10 bg-[#f4f3ee] lg:hidden" aria-label="Mobile">
          <ul className="container-editorial grid grid-cols-2 gap-x-6 gap-y-1 py-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block border-b border-black/10 py-3 text-[10px] font-bold uppercase tracking-[.1em]">
                  {item.label}
                </Link>
              </li>
            ))}
            <li><Link href="/search" onClick={() => setOpen(false)} className="block border-b border-black/10 py-3 text-[10px] font-bold uppercase tracking-[.1em]">Search</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
