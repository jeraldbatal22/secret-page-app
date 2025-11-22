"use client";

import MainLayout from "@/components/layout";
import { AuthForm } from "@/components/modals/auth-form";
import { useAppSelector } from "@/lib/hooks";

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center  gap-3">
        {!isAuthenticated && <AuthForm />}
      </div>
    </MainLayout>
  );
}
