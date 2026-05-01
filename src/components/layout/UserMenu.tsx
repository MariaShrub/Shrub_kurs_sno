"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutDashboard, LogOut, UserCog } from "lucide-react";

function initialsFor(name: string | null | undefined, fallback: string) {
  const source = (name ?? fallback).trim();
  const parts = source.split(/\s+/).slice(0, 2);
  return parts
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const session = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  if (session.isPending) {
    return (
      <div
        aria-hidden
        className="h-9 w-24 rounded-full bg-muted/40 animate-pulse"
      />
    );
  }

  const user = session.data?.user;

  if (!user) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="bg-white/70 rounded-full"
      >
        <Link href="/login">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline">Кабинет</span>
        </Link>
      </Button>
    );
  }

  const isAdmin = user.role === "admin";
  const initials = initialsFor(user.name, user.email);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    const res = await authClient.signOut();
    if (res.error) {
      toast.error("Не удалось выйти. Попробуйте ещё раз.");
      setSigningOut(false);
      return;
    }
    window.location.href = window.location.pathname;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full border border-border/50 bg-white/70 backdrop-blur px-1.5 py-1 pr-3 text-sm font-medium hover:shadow-soft transition-all"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-brand text-white text-xs font-semibold shadow-soft">
            {initials || <UserCog className="h-4 w-4" />}
          </span>
          <span className="hidden sm:inline max-w-[120px] truncate">
            {user.name || user.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Аккаунт</DropdownMenuLabel>
        <div className="px-3 pb-2">
          <div className="font-medium truncate">{user.name || "—"}</div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
          {isAdmin && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#C565FF]/12 px-2 py-0.5 text-xs font-medium text-[#5144B0]">
              Администратор
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={isAdmin ? "/admin" : "/cabinet"}>
            <LayoutDashboard className="h-4 w-4" />
            {isAdmin ? "Админка" : "Мой кабинет"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={signingOut}
          className="text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Выход..." : "Выйти"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
