"use client";

import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useAccountActions } from "../hooks/use-account-actions";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAppSelector } from "@/lib/hooks";
import { Label } from "../ui/label";

export function Navigation() {
  const { signOut, deleteAccount, isSigningOut, isDeleting } =
    useAccountActions();
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <NavigationMenu className="w-full max-w-5xl justify-between rounded-2xl border border-white/10 bg-white/80 px-4 py-4 text-sm shadow-lg backdrop-blur-lg dark:bg-black/40">
      <NavigationMenuList className="flex w-full flex-wrap items-center gap-3 text-sm font-medium">
        <NavigationMenuItem className="w-full text-center text-base font-semibold uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100 sm:w-auto sm:text-left">
          <Link href="/secret-page-1">Secret App</Link>
        </NavigationMenuItem>
        <NavigationMenuItem className="w-full sm:w-auto">
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} w-full sm:w-auto`}
          >
            <Link href="/secret-page-1">Secret Page 1</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="w-full sm:w-auto">
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} w-full sm:w-auto`}
          >
            <Link href="/secret-page-2">Secret Page 2</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="w-full sm:w-auto">
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} w-full sm:w-auto`}
          >
            <Link href="/secret-page-3">Secret Page 3</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="w-full sm:w-auto sm:ml-auto"></NavigationMenuItem>
      </NavigationMenuList>
      <div className="flex gap-4 items-center">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={signOut}
            disabled={isSigningOut || isDeleting}
            className="w-full sm:w-auto"
          >
            {isSigningOut ? "Signing out..." : "Logout"}
          </Button>
          <Button
            variant="destructive"
            onClick={deleteAccount}
            disabled={isDeleting || isSigningOut}
            className="w-full sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
        <div className="flex gap-3 items-center">
          <Label>{user?.email?.split("@")[0]}</Label>

          <Avatar className="size-12 border border-slate-100 bg-linear-to-br from-violet-100 via-pink-50 to-orange-50">
            <AvatarFallback className="text-sm font-semibold text-violet-700">
              {user?.email
                ?.split("@")[0]
                ?.split(" ")
                ?.map((part: string) => part[0])
                ?.join("")
                ?.slice(0, 2)
                ?.toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </NavigationMenu>
  );
}
