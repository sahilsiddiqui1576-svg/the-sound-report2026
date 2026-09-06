import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COLLECTIONS, CollectionSlug } from "@/lib/types";

function rowFromMarkdown(collection: CollectionSlug, raw: string) {
  const {data,content}=matter(raw) as any;
  return {collection,title:data.title,slug:data.slug,publish_date:data.publishDate,updated_date:data.updatedDate||null,featured:!!data.featured,draft:!!data.draft,category:data.category||"",tags:data.tags||[],genre:data.genre||[],mood:data.mood||[],language:data.language||[],month:data.month||null,year:data.year||null,cover_image:data.coverImage||"",cover_image_alt:data.coverImageAlt||null,excerpt:data.excerpt||"",author:data.author||null,display_order:data.order??null,artist_name:data.artistName||null,artist_image:data.artistImage||null,location:data.location||null,country:data.country||null,artist_links:data.artistLinks||{},curator:data.curator||null,spotify_url:data.spotifyUrl||null,apple_music_url:data.appleMusicUrl||null,youtube_url:data.youtubeUrl||null,week_label:data.weekLabel||null,research_notes:data.researchNotes||null,tracks:data.tracks||[],body:content,seo_title:data.seoTitle||null,seo_description:data.seoDescription||null,seo_image:data.seoImage||null,canonical_url:data.canonicalUrl||null};
}

export async function POST(req:Request){
  const session=await createClient(); const {data:{user}}=await session.auth.getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:"SUPABASE_SERVICE_ROLE_KEY is not configured."},{status:500});
  const admin=createAdminClient(); const root=path.join(process.cwd(),'content'); let imported=0;
  const replace = new URL(req.url).searchParams.get('replace') === 'true';
  if (replace) { const { error: clearError } = await admin.from('content_entries').delete().not('id','is',null); if (clearError) return NextResponse.json({error:clearError.message},{status:500}); }
  for(const collection of Object.keys(COLLECTIONS) as CollectionSlug[]){
    const dir=path.join(root,COLLECTIONS[collection].dir); if(!fs.existsSync(dir))continue;
    for(const file of fs.readdirSync(dir).filter(f=>/\.mdx?$/.test(f))){const raw=fs.readFileSync(path.join(dir,file),'utf8');const row=rowFromMarkdown(collection,raw);const {error}=await admin.from('content_entries').upsert(row,{onConflict:'collection,slug'});if(error)return NextResponse.json({error:error.message,collection,file},{status:500});imported++;}
  }
  const sitePath=path.join(root,"settings","site.md");
  if(fs.existsSync(sitePath)){ const {data}=matter(fs.readFileSync(sitePath,"utf8")) as any; await admin.from("site_settings").upsert({id:true,site_name:data.siteName||"The Sound Report",tagline:data.tagline||"",founder_name:data.founderName||"",default_seo_description:data.defaultSeoDescription||"",default_seo_image:data.defaultSeoImage||"/images/hero-crowd.jpg",socials:data.socials||{}},{onConflict:"id"}); }
  const homePath=path.join(root,"settings","homepage.md");
  if(fs.existsSync(homePath)){ const {data}=matter(fs.readFileSync(homePath,"utf8")) as any; const all=await admin.from("content_entries").select("id,collection,slug"); const byRef=new Map<string,string>((all.data||[]).map((r:any)=>[`content/${r.collection}/${r.slug}.md`,r.id])); const resolve=(ref:string)=>ref?byRef.get(ref)||null:null; const featured=(data.featuredArticles||[]).map((x:any)=>resolve(x.article)).filter(Boolean); await admin.from("homepage_settings").upsert({id:true,hero_entry_id:resolve(data.heroArticle),featured_entry_ids:featured,featured_artist_id:resolve(data.featuredArtist),featured_playlist_id:resolve(data.featuredPlaylist),weekly_pick_id:resolve(data.weeklyPick),monthly_review_id:resolve(data.monthlyReview),trend_report_id:resolve(data.trendReport),industry_insight_id:resolve(data.industryInsight),newsletter_heading:data.newsletterHeading||null,newsletter_body:data.newsletterBody||null},{onConflict:"id"}); }
  return NextResponse.json({ok:true,imported});
}
