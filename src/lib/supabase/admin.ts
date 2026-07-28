import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service role key. Solo debe usarse en código server-side
 * (Server Components, Server Actions, Route Handlers). Ignora RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
