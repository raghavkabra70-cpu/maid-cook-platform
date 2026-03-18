// ─── frontend/src/lib/supabase.ts ───
// Supabase client configuration for browser and server

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Browser client — used in React components
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Re-export for convenience
export const supabase = createClient();
