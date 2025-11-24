import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// // version A (function)
// export const supabaseClient = () =>
//   createClient(
//     supabaseUrl!,
//     supabaseKey!,
//   );

// version B (instance)
  export const supabaseClient = createClient(supabaseUrl!, supabaseKey!);