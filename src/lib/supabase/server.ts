import "server-only";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para auth del panel admin, ligado a las cookies de la
 * request actual (patrón oficial @supabase/ssr para Next.js App Router).
 * Debe crearse uno nuevo por request/Server Action.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll fue llamado desde un Server Component: se puede ignorar
            // si hay middleware refrescando la sesión.
          }
        },
      },
    }
  );
}
