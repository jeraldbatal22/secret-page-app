"use client";

import MainLayout from "@/components/layout";
import { AuthModal } from "@/components/modals/auth-modal";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";
import { useState } from "react";

export default function HomePage() {
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center  gap-3">
        {!isAuthenticated && (
          <>
            <Button onClick={() => setIsOpenAuthModal(true)}>
              Login/Register
            </Button>
            <AuthModal
              isOpen={isOpenAuthModal}
              onHandleToggleModal={() => setIsOpenAuthModal(false)}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
