import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created when first used at runtime, not at build time.
// This prevents "supabaseUrl is required" errors during Vercel's static build phase.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }

  _client = createClient(url, key);
  return _client;
}

// Re-export as a Proxy so call-sites can keep using `supabaseAdmin.from(...)` unchanged.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
