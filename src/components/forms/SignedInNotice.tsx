"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboard } from "lucide-react";

type Mode = "guest" | "not-admin";

export function FormGate({
  children,
  mode = "guest",
  notice,
}: {
  children: React.ReactNode;
  mode?: Mode;
  notice: string;
}) {
  const session = authClient.useSession();

  if (session.isPending) {
    return (
      <div
        aria-hidden
        className="rounded-3xl border border-border/50 bg-white h-32 animate-pulse"
      />
    );
  }

  const user = session.data?.user;
  const shouldHide =
    mode === "guest"
      ? !!user
      : user?.role === "admin"; 

  if (!shouldHide) return <>{children}</>;

  return (
    <div className="rounded-3xl border border-[#C565FF]/30 bg-white p-6 md:p-8 shadow-soft flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div>
        <div className="text-sm text-muted-foreground">Вы вошли как</div>
        <div className="font-semibold mt-0.5">{user?.name || user?.email}</div>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{notice}</p>
      </div>
      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full bg-[#5144B0] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#3f3590] transition-colors whitespace-nowrap"
        >
          <LayoutDashboard className="h-4 w-4" />
          В админку
        </Link>
      )}
    </div>
  );
}

export const GuestOnly = FormGate;
