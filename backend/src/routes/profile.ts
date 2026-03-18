// ─── backend/src/routes/profile.ts ───
// API routes for profile CRUD operations

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createAdminClient } from "@/config/supabase-server";
import { z } from "zod";

// ─── GET /api/profile ───
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

// ─── POST /api/profile ─── (create)
const CreateProfileSchema = z.object({
  role: z.enum(["cook", "household"]),
  full_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  bio: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cuisines: z.array(z.string()).optional(),
  availability: z.record(z.array(z.string())).optional(),
  price_range: z.string().optional(),
  service_radius_km: z.number().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = CreateProfileSchema.parse(body);

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ─── PUT /api/profile ─── (update)
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// ─── DELETE /api/profile ─── (delete account)
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete profile (cascades to reviews, favorites, inquiries)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);
    
    if (profileError) throw profileError;

    // Delete auth user using admin client
    const admin = createAdminClient();
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) throw authDeleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
