import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlobBackground } from "@/components/ui/blob-background";
import { ArrowLeft, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ConferenceApplicationForm } from "@/components/forms/ConferenceApplicationForm";
import { FormGate } from "@/components/forms/SignedInNotice";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ev = await api.events.byId(id);
  if (!ev) notFound();
  const upcoming = new Date(ev.startDate) >= new Date();
  const isConference = ev.type === "conference";

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] -z-10 overflow-hidden">
        <div className="absolute inset-0 gradient-brand-soft" />
        <BlobBackground variant="soft" />
      </div>
      <div className="container py-8 max-w-4xl space-y-8">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" /> Все мероприятия
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={isConference ? "default" : "secondary"}
              className="rounded-full"
            >
              {isConference ? "Конференция" : "Мероприятие"}
            </Badge>
            <Badge
              variant={upcoming ? "success" : "outline"}
              className="rounded-full"
            >
              {upcoming ? "Предстоит" : "Прошло"}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {ev.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDate(ev.startDate)}
              {ev.endDate ? ` — ${formatDate(ev.endDate)}` : ""}
            </span>
            {ev.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {ev.location}
              </span>
            )}
          </div>
        </div>

        {ev.coverUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={ev.coverUrl}
            alt={ev.title}
            className="w-full max-h-96 object-cover rounded-3xl shadow-soft"
          />
        )}

        <div className="rounded-3xl border border-border/50 bg-white p-6 md:p-8 shadow-soft">
          <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
            {ev.description}
          </p>
        </div>

        {isConference && ev.sections.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8A4DFF]" />
              Секции
            </h2>
            <div className="flex flex-wrap gap-2">
              {ev.sections.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="rounded-full px-4 py-1.5 text-sm"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isConference && upcoming && ev.sections.length > 0 && (
          <FormGate
            mode="not-admin"
            notice="Заявки на конференцию подают гости и участники СНО. Администратор только модерирует — управлять заявками вы можете в админке."
          >
            <ConferenceApplicationForm
              eventId={ev.id}
              eventTitle={ev.title}
              sections={ev.sections}
            />
          </FormGate>
        )}
      </div>
    </div>
  );
}
