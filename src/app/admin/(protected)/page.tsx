import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Mic, Users, CalendarDays } from "lucide-react";

export default async function AdminDashboard() {
  const summary = await api.reports.summary();
  const cards = [
    {
      label: "Заявки на вступление",
      value: summary.pendingJoin,
      icon: Mail,
      href: "/admin/applications",
      sub: "ожидают рассмотрения",
    },
    {
      label: "Заявки на конференции",
      value: summary.pendingConference,
      icon: Mic,
      href: "/admin/conference-applications",
      sub: "ожидают рассмотрения",
    },
    {
      label: "Участники СНО ОмГУПС",
      value: summary.membersCount,
      icon: Users,
      href: "/admin/members",
      sub: "всего",
    },
    {
      label: "Предстоящих мероприятий",
      value: summary.upcomingEvents,
      icon: CalendarDays,
      href: "/admin/events",
      sub: "в расписании",
    },
  ];
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {c.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{c.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.sub}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
