"use server";

import { supabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function deleteAccountAction(userId: string) {
  try {
    const supabase = await supabaseServerClient(true);

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { error };
    }

    const result = await supabase.auth.signOut();

    if (result?.error) {
      return { error: result.error };
    }
    revalidatePath("/", "layout");
  } catch (error: any) {
    return { error: error || "Failed to delete account" };
  }
}

async function signoutAccountAction() {
  try {
    const result = await (await supabaseServerClient()).auth.signOut();

    if (result?.error) {
      return { error: result.error };
    }

    revalidatePath("/", "layout");
  } catch (error: any) {
    return { error: error || "Failed to signout account" };
  }
}

export { deleteAccountAction, signoutAccountAction };
