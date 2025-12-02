"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { redirect, usePathname } from "next/navigation";
import { deleteAccountAction, signoutAccountAction } from "./action";
import { showToast } from "@/lib/utils";
import { logout } from "@/lib/slices/auth-slice";

const menuItems = [
  { label: "Secret Page 1", href: "/secret-page-1" },
  { label: "Secret Page 2", href: "/secret-page-2" },
  { label: "Secret Page 3", href: "/secret-page-3" },
];

// Helper for path comparison to allow "active" state for base and subroutes
function isActiveMenu(path: string, menuHref: string): boolean {
  // menuHref === '/todo', path === '/todo' or path.startsWith('/todo/')
  if (menuHref === "/") return path === "/";
  return path === menuHref || path.startsWith(menuHref + "/");
}

const HeaderNavMenu = () => {
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();

  const userName = user?.email?.split("@")[0] || "user";
  const avatarLabel =
    user?.email
      ?.split("@")[0]
      ?.split(" ")
      ?.map((part: any) => part[0])
      ?.join("")
      ?.slice(0, 2)
      ?.toUpperCase() || "??";

  const handleDeleteAccunt = async () => {
    setIsLoading(true);
    const response = await deleteAccountAction((user?.id) as string);
    if (response?.error) {
      showToast(response?.error?.message || "Failed to delete account", "error");
      return;
    }
    setIsLoading(false);
    dispatch(logout());
    showToast("Your account has been deleted. Come back soon!", "success");
    redirect("/");
  };

  const handleSignout = async () => {
    setIsLoading(true);

    const response = await signoutAccountAction();

    if (response?.error) {
      showToast(
        response?.error?.message || "Failed to signout account",
        "error"
      );
      return;
    }

    setIsLoading(false);
    dispatch(logout());
    showToast("Your account has been logout!", "success");
    redirect("/");
  };

  return (
    <nav className="w-full z-1 bg-white dark:bg-black/40 shadow flex items-center justify-between px-3 sm:px-4 py-2 border border-white/10 rounded-2xl max-w-7xl mx-auto mt-4 relative">
      {/* Logo */}
      <div className="shrink-0 text-right">
        <span className="font-bold uppercase tracking-wide text-base sm:text-md bg-linear-to-r from-violet-700 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
          Secret Page App
        </span>
      </div>

      {/* Hamburger - visible on mobile only */}
      <button
        className="inline-flex items-center justify-center ml-2 sm:hidden p-2 rounded hover:bg-violet-100 dark:hover:bg-violet-800 transition"
        aria-label={
          mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        onClick={() => setMobileMenuOpen((open) => !open)}
        type="button"
      >
        <svg
          className="h-6 w-6 text-violet-700 dark:text-violet-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {mobileMenuOpen ? (
            // x icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // menu icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 8h16M4 16h16"
            />
          )}
        </svg>
      </button>

      {/* Menu list */}
      <ul
        className={`
        flex-1 flex justify-center gap-2 sm:gap-5 font-medium text-md sm:text-sm rounded-2xl
        ${
          mobileMenuOpen
            ? "flex flex-col absolute top-full left-0 w-full bg-white dark:bg-black/90 border-b border-t border-slate-200 dark:border-slate-700 z-30 shadow-lg py-2 animate-in fade-in slide-in-from-top-1"
            : "hidden"
        }
        sm:flex sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:flex-row sm:py-0 sm:animate-none
      `}
      >
        {menuItems.map((item) => {
          const active = isActiveMenu(pathname, item.href);
          return (
            <li key={item.href} className="w-full sm:w-auto text-sm px-4">
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-md text-center transition-colors
                  hover:bg-violet-100 dark:hover:bg-violet-900
                  ${
                    active
                      ? "bg-violet-200 dark:bg-violet-900 font-semibold text-violet-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-200"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
                tabIndex={
                  mobileMenuOpen || typeof window === "undefined"
                    ? 0
                    : undefined
                }
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}

        {/* Mobile-only user section inside the dropdown */}
        {mobileMenuOpen && (
          <li className="sm:hidden border-t border-slate-200 dark:border-slate-700 mt-1 pt-2 px-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="size-9 border-slate-300 border">
                <AvatarFallback className="font-bold text-violet-700 bg-violet-50 dark:bg-violet-300">
                  {avatarLabel}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {userName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 break-all">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handleSignout();
                }}
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handleDeleteAccunt();
                }}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </li>
        )}
      </ul>

      {/* RIGHT: Avatar, name, buttons (desktop only) */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4 min-w-[150px] sm:min-w-[210px]">
        <Avatar className="size-10 border-slate-300 border">
          <AvatarFallback className="font-bold text-violet-700 bg-violet-50 dark:bg-violet-300">
            {avatarLabel}
          </AvatarFallback>
        </Avatar>
        <Label className="hidden md:flex text-base font-medium text-slate-800 dark:text-slate-100">
          {userName}
        </Label>
        <div className="flex gap-1 xs:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignout}
            disabled={isLoading}
            className="min-w-[74px]"
          >
            {isLoading ? "Signing out..." : "Sign out"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAccunt}
            disabled={isLoading}
            className="min-w-[74px]"
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0  z-20 sm:hidden"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default HeaderNavMenu;
