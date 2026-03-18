// ─── backend/src/config/supabase-server.ts ───
// Server-side Supabase client with service role key
// Used for admin operations, webhooks, and API routes

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Admin client — full database access, bypasses RLS
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
