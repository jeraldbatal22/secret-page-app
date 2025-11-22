
// import { createBrowserClient } from "@supabase/ssr";



// export const createClient = () =>
//   createBrowserClient(
//     supabaseUrl!,
//     supabaseKey!,
//   );

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseClient = () =>
  createClient(
    supabaseUrl!,
    supabaseKey!,
  );