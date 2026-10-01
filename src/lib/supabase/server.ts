import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Route Handler client. Reads the session from request
// cookies; writes are only possible from a Server Action or Route Handler
// (a plain Server Component render can't set cookies, so setAll there is a
// silent no-op by design — middleware.ts is what actually keeps the
// session cookie refreshed on every request).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — expected, ignore.
          }
        },
      },
    },
  );
}
