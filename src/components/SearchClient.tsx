"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Image from "next/image";
import Link from "next/link";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { COLLECTIONS, CollectionSlug } from "@/lib/types";

interface IndexEntry { title:string; slug:string; collection:CollectionSlug; excerpt:string; tags:string[]; genre:string[]; mood:string[]; language:string[]; month:string; year:number|null; coverImage:string; publishDate:string; }

export default function SearchClient() {
  const [index, setIndex] = useState<IndexEntry[]>([]); const [query,setQuery]=useState(""); const [genre,setGenre]=useState(""); const [mood,setMood]=useState(""); const [language,setLanguage]=useState("");
  useEffect(()=>{ fetch("/search-index.json").then(r=>r.json()).then(setIndex).catch(()=>setIndex([])); },[]);
  const fuse=useMemo(()=>new Fuse(index,{keys:["title","excerpt","tags","genre","mood","language"],threshold:.35}),[index]);
  const facets=useMemo(()=>{const uniq=(a:string[])=>Array.from(new Set(a.filter(Boolean))).sort(); return {genres:uniq(index.flatMap(e=>e.genre)),moods:uniq(index.flatMap(e=>e.mood)),languages:uniq(index.flatMap(e=>e.language))};},[index]);
  const results=useMemo(()=>{let base=query.trim()?fuse.search(query).map(r=>r.item):index;if(genre)base=base.filter(e=>e.genre.includes(genre));if(mood)base=base.filter(e=>e.mood.includes(mood));if(language)base=base.filter(e=>e.language.includes(language));return base;},[query,genre,mood,language,fuse,index]);
  return <div>
    <div className="border-y border-black/10 py-4 dark:border-white/10"><div className="relative"><SearchIcon className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-accent" size={19}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stories, artists, playlists…" aria-label="Search all content" className="w-full border-0 bg-transparent py-3 pl-8 pr-3 font-display text-2xl font-bold outline-none placeholder:text-neutral-400 sm:text-3xl" /></div></div>
    <div className="flex flex-wrap gap-2 py-4 border-b border-black/10 dark:border-white/10"><FacetSelect label="Genre" value={genre} onChange={setGenre} options={facets.genres}/><FacetSelect label="Mood" value={mood} onChange={setMood} options={facets.moods}/><FacetSelect label="Language" value={language} onChange={setLanguage} options={facets.languages}/><button type="button" onClick={()=>{setQuery("");setGenre("");setMood("");setLanguage("");}} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-neutral-400 hover:text-accent">Clear all</button></div>
    <div className="flex items-center justify-between py-5"><p className="editorial-meta">{results.length} {results.length===1?"result":"results"}</p></div>
    <ul>{results.map(r=><li key={`${r.collection}-${r.slug}`}><Link href={`/${r.collection}/${r.slug}`} className="group grid grid-cols-[100px_1fr_auto] gap-4 border-t border-black/10 py-5 transition hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.02] sm:grid-cols-[180px_1fr_auto] sm:gap-6"><div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800"><Image src={r.coverImage} alt={r.title} fill sizes="180px" className="object-cover transition duration-500 group-hover:scale-105"/></div><div><p className="editorial-kicker">{COLLECTIONS[r.collection].singularLabel}</p><h2 className="mt-1 font-display text-xl font-black leading-tight sm:text-2xl">{r.title}</h2><p className="mt-2 hidden line-clamp-2 text-sm leading-5 text-neutral-500 dark:text-neutral-400 sm:block">{r.excerpt}</p></div><ArrowUpRight className="mt-1 text-neutral-400 transition group-hover:text-accent" size={20}/></Link></li>)}</ul>
    {results.length===0&&<div className="border-t border-black/10 py-20 text-center dark:border-white/10"><p className="font-display text-2xl font-black">Nothing found.</p><p className="mt-2 text-sm text-neutral-500">Try another term or clear a filter.</p></div>}
  </div>;
}
function FacetSelect({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){if(!options.length)return null;return <select value={value} onChange={e=>onChange(e.target.value)} aria-label={label} className="border border-black/10 bg-white px-3 py-2 text-xs font-semibold dark:border-white/15 dark:bg-[#161618]"><option value="">{label}: All</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>;}
