import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { guard, jsonError } from "@/lib/security";

export async function GET(req: NextRequest) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  // Sengaja tidak memilih password_hash / session_version.
  const { data, error } = await db().from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }).limit(500);
  if (error) return jsonError(500, "Terjadi kesalahan pada server");
  return NextResponse.json({ users: data });
}
