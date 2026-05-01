import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/ui/page-hero";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { formatDate } from "@/lib/utils";
import { ArrowRight, CalendarDays, MapPin, Mic } from "lucide-react";

export const metadata = { title: "Мероприятия и конференции" };

export default async function EventsListPage() {
  const all = await api.events.list();
  const events = all.filter((e) => e.type === "event");
  const conferences = all.filter((e) => e.type === "conference");

  return (
    <div>
      <PageHero
        badge="Календарь"
        title={
          <>
            Мероприятия и <span className="text-gradient">конференции</span>
          </>
        }
        subtitle="Заседания, лекции, школы, конференции — всё, что СНО ОмГУПС проводит для своих участников и гостей."
      />
      <div className="container py-12 space-y-16">
        <Section
          title="Конференции"
          icon={<Mic className="h-5 w-5" />}
          items={conferences}
          empty="Конференций пока нет."
        />
        <Section
          title="Мероприятия"
          icon={<CalendarDays className="h-5 w-5" />}
          items={events}
          empty="Мероприятий пока нет."
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: Awaited<ReturnType<typeof api.events.list>>;
  empty: string;
}) {
  return (
    <section>
      <ScrollReveal>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl gradient-brand text-white shadow-soft">
            {icon}
          </span>
          {title}
        </h2>
      </ScrollReveal>
      {items.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((e) => {
            const upcoming = new Date(e.startDate) >= new Date();
            return (
              <StaggerItem key={e.id}>
                <Link href={`/events/${e.id}`} className="block group h-full">
                  <div className="relative h-full rounded-3xl border border-border/50 bg-white p-6 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow overflow-hidden">
                    <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br from-[#C565FF] to-[#FBBBFF] opacity-15 blur-2xl group-hover:opacity-30 transition-opacity" />
                    <div className="relative flex items-start justify-between gap-2">
                      <Badge
                        variant={e.type === "conference" ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {e.type === "conference" ? "Конференция" : "Мероприятие"}
                      </Badge>
                      <Badge
                        variant={upcoming ? "success" : "outline"}
                        className="rounded-full"
                      >
                        {upcoming ? "Предстоит" : "Прошло"}
                      </Badge>
                    </div>
                    <h3 className="relative mt-4 text-xl font-semibold group-hover:text-[#5144B0] transition-colors">
                      {e.title}
                    </h3>
                    <div className="relative mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(e.startDate)}
                        {e.endDate ? ` — ${formatDate(e.endDate)}` : ""}
                      </span>
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {e.location}
                        </span>
                      )}
                    </div>
                    <p className="relative mt-3 text-sm text-muted-foreground line-clamp-3">
                      {e.description}
                    </p>
                    <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#8A4DFF]">
                      Подробнее
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </section>
  );
}
