"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/members", label: "Состав" },
  { href: "/events", label: "Мероприятия" },
  { href: "/news", label: "Новости" },
  { href: "/gallery", label: "Галерея" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const session = authClient.useSession();
  const showJoinCta = !session.isPending && !session.data?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-border/40 shadow-soft"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg group"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-gradient text-xl tracking-tight">СНО</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  active
                    ? "text-[#5144B0]"
                    : "text-foreground/70 hover:text-[#5144B0]",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-[#C565FF]/12 -z-10" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {showJoinCta && (
            <Button asChild size="sm" className="hidden sm:inline-flex group rounded-full">
              <Link href="/apply">
                Вступить
                <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Button>
          )}
          <UserMenu />
        </div>
      </div>
      <nav className="md:hidden border-t border-border/40 bg-white/70 backdrop-blur">
        <div className="container flex overflow-x-auto gap-1 py-2 no-scrollbar">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors",
                  active
                    ? "bg-[#C565FF]/12 text-[#5144B0]"
                    : "text-foreground/70 hover:text-[#5144B0]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
