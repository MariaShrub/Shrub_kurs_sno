"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Mail,
  Mic,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Заявки на вступление", icon: Mail },
  {
    href: "/admin/conference-applications",
    label: "Заявки на конференции",
    icon: Mic,
  },
  { href: "/admin/members", label: "Участники", icon: Users },
  { href: "/admin/events", label: "Мероприятия", icon: CalendarDays },
  { href: "/admin/news", label: "Новости", icon: FileText },
  { href: "/admin/gallery", label: "Галерея", icon: ImageIcon },
  { href: "/admin/reports", label: "Отчёты", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    const res = await authClient.signOut();
    if (res.error) {
      toast.error("Не удалось выйти. Попробуйте ещё раз.");
      setSigningOut(false);
      return;
    }
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      <div className="px-6 py-4 border-b">
        <Link href="/admin" className="font-semibold text-lg">
          СНО · Админка
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent",
                active && "bg-accent font-medium",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
          <Link href="/">
            <Home className="h-4 w-4" /> На сайт
          </Link>
        </Button>
        <Button
          onClick={logout}
          variant="ghost"
          size="sm"
          disabled={signingOut}
          className="w-full justify-start text-destructive"
        >
          <LogOut className="h-4 w-4" /> {signingOut ? "Выход..." : "Выйти"}
        </Button>
      </div>
    </aside>
  );
}
