import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authed() { const s=await createClient(); const {data:{user}}=await s.auth.getUser(); return {s,user}; }

export async function GET(req: Request) {
  const {s,user}=await authed(); if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const collection=new URL(req.url).searchParams.get("collection");
  let q=s.from("content_entries").select("*").order("publish_date",{ascending:false});
  if(collection) q=q.eq("collection",collection);
  const {data,error}=await q; if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const {s,user}=await authed(); if(!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=await req.json();
  const {data,error}=await s.from("content_entries").insert(body).select().single();
  if(error) return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
}
