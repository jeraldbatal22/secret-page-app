"use client";
import React, { useEffect } from "react";
import { supabaseClient } from "@/utils/supabase/client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, setCredentials } from "@/lib/slices/auth-slice";
import { useRouter } from "next/navigation";
import HeaderNavMenu from "./header-nav-menu";

const MainLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // const fetchSession = async () => {
  //   const session = await supabaseClient.auth.getSession();
  //   console.log(session, 'asdasd')
  // };

  useEffect(() => {
    // fetchSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          router.push("/");
          dispatch(logout());
        } else {
          dispatch(
            setCredentials({
              user: {
                id: session.user.id,
                email: session.user.email || "",
                phone: session.user.phone || "",
                isVerified:
                  !!session.user.email_confirmed_at ||
                  !!session.user.phone_confirmed_at,
              },
              token: session.access_token,
              refresh_token: session.refresh_token,
            })
          );
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="max-w-7xl mx-auto flex min-h-screen flex-col font-sans dark:bg-black">
      {isAuthenticated && (
        <div className="flex justify-center px-4 pt-6 sm:pt-10 w-full">
          {/* <Navigation /> */}
          <HeaderNavMenu />
        </div>
      )}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
};

export default MainLayout;
