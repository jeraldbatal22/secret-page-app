import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      body.userId
    );
    if (deleteError)
      return NextResponse.json(
        { error: deleteError.message || "Failed to delete account" },
        { status: 400 }
      );

    // 2️⃣ Delete user from profiles table
    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", body.userId);
    if (dbError)
      return NextResponse.json(
        { error: dbError.message || "Failed to delete account" },
        { status: 400 }
      );

    // For now, returning a success response to fix the error
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
    console.error("Error deleting account:", error, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
