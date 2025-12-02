"use client";

import MainLayout from "@/components/layout";
import { AuthForm } from "@/components/forms/auth-form";
import { useAppSelector } from "@/lib/hooks";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    redirect("/secret-page-1");
  }

  return (
    <MainLayout>
      <div className="gap-3 flex min-h-screen items-center justify-center ">
        {<AuthForm />}
      </div>
    </MainLayout>
  );
}
