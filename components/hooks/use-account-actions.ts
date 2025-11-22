"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout } from "@/lib/slices/auth-slice";
import { supabaseClient } from "@/utils/supabase/client";
import { showToast } from "@/lib/utils";

type AccountActions = {
  isSigningOut: boolean;
  isDeleting: boolean;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export const useAccountActions = (): AccountActions => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await supabaseClient().auth.signOut();
      dispatch(logout());
      showToast("Signed out successfully", "success");
    } catch (error) {
      showToast("Unable to sign out right now. Please try again.", "error");
      console.error(error);
    } finally {
      setIsSigningOut(false);
    }
  }, [dispatch, isSigningOut]);

  const deleteAccount = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("http://localhost:3000/api/delete-account", {
        // headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ userId: user?.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "Failed to delete account", "error");
        return;
      }

      // Sign out the user locally
      await supabaseClient().auth.signOut();
      dispatch(logout());
      router.push("/");
      showToast("Your account has been deleted. Come back soon!", "success");
    } catch (error) {
      console.error(error, "error");
      showToast("We couldn't remove your account. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, router, isDeleting, user]);

  return {
    isSigningOut,
    isDeleting,
    signOut,
    deleteAccount,
  };
};
