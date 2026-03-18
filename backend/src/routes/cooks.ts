// ─── backend/src/routes/cooks.ts ───
// API route: /api/cooks/search
// Handles cook search with filters and proximity

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

const SearchSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius_km: z.number().min(1).max(100).default(20),
  cuisines: z.array(z.string()).optional(),
  day: z.string().optional(),
  price_range: z.string().optional(),
  query: z.string().optional(),
  sort_by: z.enum(["distance", "rating", "reviews"]).default("distance"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = SearchSchema.parse(body);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("search_nearby_cooks", {
      user_lat: params.latitude,
      user_lng: params.longitude,
      radius_km: params.radius_km,
      cuisine_filter: params.cuisines || null,
      day_filter: params.day || null,
      price_filter: params.price_range || null,
      search_query: params.query || null,
      sort_by: params.sort_by,
      result_limit: params.limit,
      result_offset: params.offset,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0,
    });
  } catch (err: any) {
    console.error("Cook search error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Search failed" },
      { status: 400 }
    );
  }
}
