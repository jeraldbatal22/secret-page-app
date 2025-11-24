import React, { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { useAccountActions } from "../hooks/use-account-actions";
import { usePathname } from "next/navigation";

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
  const { signOut, deleteAccount, isSigningOut, isDeleting } =
    useAccountActions();
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white/80 dark:bg-black/40 backdrop-blur-md shadow flex items-center justify-between px-4 py-2 border border-white/10 rounded-2xl max-w-7xl mx-auto mt-4 relative">
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
        flex-1 flex justify-center gap-2 sm:gap-5 font-medium text-md sm:text-sm
        ${
          mobileMenuOpen
            ? "flex flex-col absolute top-full left-0 w-full bg-white/90 dark:bg-black/90 border-b border-t border-slate-200 dark:border-slate-700 z-30 shadow-lg py-2 animate-in fade-in slide-in-from-top-1"
            : "hidden"
        }
        sm:flex sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:flex-row sm:py-0 sm:animate-none
      `}
      >
        {menuItems.map((item) => {
          const active = isActiveMenu(pathname, item.href);
          return (
            <li key={item.href} className="w-full sm:w-auto text-sm">
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
      </ul>

      {/* RIGHT: Avatar, name, buttons */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-[150px] sm:min-w-[210px]">
        <Avatar className="size-10 border-slate-300 border">
          <AvatarFallback className="font-bold text-violet-700 bg-violet-50 dark:bg-violet-300">
            {avatarLabel}
          </AvatarFallback>
        </Avatar>
        <Label className="flex xs:hidden text-base font-medium text-slate-800 dark:text-slate-100">
          {userName}
        </Label>
        <div className="flex gap-1 xs:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            disabled={isSigningOut || isDeleting}
            className="min-w-[74px]"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteAccount}
            disabled={isDeleting || isSigningOut}
            className="min-w-[74px]"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 sm:hidden"
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default HeaderNavMenu;
