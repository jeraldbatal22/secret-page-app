// import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// // // version A (function)
// // export const supabaseClient = () =>
// //   createClient(
// //     supabaseUrl!,
// //     supabaseKey!,
// //   );

// // version B (instance)
//   export const supabaseClient = createClient(supabaseUrl!, supabaseKey!);

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use ANON_KEY, not PUBLISHABLE_KEY
  );
}

// For backwards compatibility, export a getter
export const supabaseClient = createClient();
// export const getSupabaseClient = () => createClient();
