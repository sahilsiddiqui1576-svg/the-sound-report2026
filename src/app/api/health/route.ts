import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({ok:true,service:"the-sound-report",databaseConfigured:hasSupabase(),timestamp:new Date().toISOString()});}
