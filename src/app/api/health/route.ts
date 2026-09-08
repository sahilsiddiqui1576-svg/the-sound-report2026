import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
export const dynamic="force-dynamic";
export async function GET(){if(!hasSupabase())return NextResponse.json({ok:false,service:"the-sound-report",databaseConfigured:false,timestamp:new Date().toISOString()},{status:503});const supabase=await createClient();const {count,error}=await supabase.from("platforms").select("id",{count:"exact",head:true});return NextResponse.json({ok:!error,service:"the-sound-report",databaseConfigured:true,databaseReachable:!error,platformCount:count??0,timestamp:new Date().toISOString()},{status:error?503:200});}
