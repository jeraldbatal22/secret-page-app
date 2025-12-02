import { createServerClient as serverClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createServerClient(isUseSupabaseServiceRoleKey = false) {
  const cookieStore = await cookies();

  return await serverClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isUseSupabaseServiceRoleKey ? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              cookieStore.set(name, value)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export const supabaseServerClient = createServerClient;
