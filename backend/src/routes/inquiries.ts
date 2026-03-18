// ─── backend/src/routes/inquiries.ts ───
// API routes for managing cook inquiries

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

// ─── POST /api/inquiries ─── (send inquiry to a cook)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { cook_id, message } = z.object({
    cook_id: z.string().uuid(),
    message: z.string().max(500).optional(),
  }).parse(body);

  const { data, error } = await supabase
    .from("inquiries")
    .insert({ cook_id, household_id: user.id, message })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ inquiry: data });
}

// ─── GET /api/inquiries ─── (list my inquiries)
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("inquiries")
    .select(`
      *,
      cook:profiles!inquiries_cook_id_fkey(full_name, avatar_url, cuisines, city),
      household:profiles!inquiries_household_id_fkey(full_name, avatar_url, city)
    `)
    .or(`cook_id.eq.${user.id},household_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiries: data });
}

// ─── PATCH /api/inquiries ─── (cook accepts/declines)
export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, status } = z.object({
    id: z.string().uuid(),
    status: z.enum(["accepted", "declined"]),
  }).parse(body);

  const { data, error } = await supabase
    .from("inquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("cook_id", user.id) // Only the cook can update
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ inquiry: data });
}
