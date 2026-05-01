"use client";

import { api } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { CalendarDays, Mic } from "lucide-react";

const statusBadge = {
  pending: { label: "Ожидает рассмотрения", variant: "warning" as const },
  approved: { label: "Одобрена", variant: "success" as const },
  rejected: { label: "Отклонена", variant: "destructive" as const },
};

export function ConferenceApplicationsList() {
  const list = api.cabinet.myConferenceApplications.useQuery();

  if (list.isLoading) {
    return <div className="text-muted-foreground">Загрузка...</div>;
  }
  if (!list.data || list.data.length === 0) {
    return (
      <div className="rounded-3xl border border-border/50 bg-white p-8 text-center shadow-soft">
        <Mic className="h-10 w-10 mx-auto mb-3 text-[#8A4DFF]/60" />
        <p className="text-muted-foreground">
          Вы ещё не подавали заявки на конференции.
        </p>
        <Link
          href="/events"
          className="mt-3 inline-block text-sm text-[#5144B0] underline-offset-4 hover:underline"
        >
          Посмотреть предстоящие конференции →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.data.map(({ app, event }) => (
        <div
          key={app.id}
          className="rounded-3xl border border-border/50 bg-white p-5 md:p-6 shadow-soft"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant={statusBadge[app.status].variant} className="rounded-full">
                  {statusBadge[app.status].label}
                </Badge>
                {event?.startDate && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(event.startDate)}
                  </span>
                )}
              </div>
              {event ? (
                <Link
                  href={`/events/${event.id}`}
                  className="font-semibold text-lg hover:text-[#5144B0]"
                >
                  {event.title}
                </Link>
              ) : (
                <span className="font-semibold text-lg">Конференция удалена</span>
              )}
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Секция:</span>{" "}
                <span className="font-medium">{app.section}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Тема:</span>{" "}
                <span className="font-medium">{app.topic}</span>
              </div>
              {app.reviewerNote && (
                <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Комментарий администратора:</span>
                  <div className="mt-1">{app.reviewerNote}</div>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Подано {formatDateTime(app.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
