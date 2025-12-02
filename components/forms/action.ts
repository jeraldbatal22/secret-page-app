"use server";

import { supabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function loginAction(values: any) {
  const supabase = await supabaseServerClient();

  const data = {
    email: values.email,
    password: values.password,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error };
  }

  revalidatePath("/", "layout");
  redirect("/secret-page-1");
}

async function registerAction(values: any) {
  try {
    const supabase = await supabaseServerClient();

    const payload = {
      email: values.email,
      password: values.password,
    };

    const { error, data } = await supabase.auth.signUp(payload);

    if (error) {
      return { error };
    }

    revalidatePath("/", "layout");

    return {
      data,
    };
  } catch (error: any) {
    return { error: error || "Failed to register account" };
  }
}

export { loginAction, registerAction };
