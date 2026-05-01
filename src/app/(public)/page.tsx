import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import GameBot from "@/components/GameBot/GameBot";
import MusicPlayer from "@/components/MusicPlayer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlobBackground } from "@/components/ui/blob-background";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TiltCard } from "@/components/ui/tilt-card";
import { HeroPhotoCollage } from "@/components/home/HeroPhotoCollage";
import { PhotoMarquee } from "@/components/home/PhotoMarquee";
import { GalleryShowcase } from "@/components/home/GalleryShowcase";
import {
  ArrowRight,
  Atom,
  CalendarDays,
  Newspaper,
  Sparkles,
  Trophy,
  Users,
  GraduationCap,
  HandshakeIcon,
  Lightbulb,
  Camera,
} from "lucide-react";

const sno_essence = [
  {
    icon: Atom,
    title: "Научные исследования",
    desc: "Реальные проекты под руководством преподавателей и научных сотрудников.",
    color: "from-[#5144B0] to-[#8A4DFF]",
  },
  {
    icon: HandshakeIcon,
    title: "Сотрудничество",
    desc: "Контакты с университетами, лабораториями и индустриальными партнёрами.",
    color: "from-[#8A4DFF] to-[#C565FF]",
  },
  {
    icon: Trophy,
    title: "Практические навыки",
    desc: "Конференции, доклады, публикации, гранты — всё, что строит CV.",
    color: "from-[#C565FF] to-[#E183FF]",
  },
  {
    icon: Lightbulb,
    title: "Тренды науки",
    desc: "Знакомство с новейшими направлениями — от ИИ до квантовых вычислений.",
    color: "from-[#E183FF] to-[#FBBBFF]",
  },
] as const;

export default async function HomePage() {
  const [newsList, upcomingEvents, faqList, members, photos] = await Promise.all([
    api.news.list({ limit: 3 }),
    api.events.list({ upcomingOnly: true }),
    api.faq.list(),
    api.members.list(),
    api.gallery.list(),
  ]);

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <BlobBackground />
        <MusicPlayer />
        <GameBot />
        <div className="absolute inset-0 bg-grid opacity-30 -z-10" />
        <div className="container relative py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C565FF]/30 bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-medium text-[#5144B0] mb-6 shadow-soft">
                  <Sparkles className="h-4 w-4" />
                  Студенческое научное общество
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">
                  Раскройте свой
                  <br />
                  <span className="text-gradient animate-gradient">научный</span>
                  <br />
                  <span className="text-gradient animate-gradient">потенциал</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
                  Объединяем студентов, увлечённых наукой. Конференции, лекции,
                  исследовательские проекты — всё в одном месте.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-7 group shadow-glow"
                  >
                    <Link href="/apply">
                      Подать заявку
                      <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full px-7 bg-white/70 backdrop-blur"
                  >
                    <Link href="/events">Мероприятия</Link>
                  </Button>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <StaggerContainer className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
                  {[
                    { icon: Users, value: members.length, label: "участников", suffix: "+" },
                    { icon: CalendarDays, value: upcomingEvents.length, label: "событий" },
                    { icon: Newspaper, value: newsList.length, label: "новостей", suffix: "+" },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <StaggerItem key={i}>
                        <div className="rounded-2xl glass-strong border border-border/50 p-4 shadow-soft">
                          <Icon className="h-5 w-5 text-[#8A4DFF] mb-2" />
                          <div className="text-2xl font-bold text-gradient">
                            <AnimatedCounter value={s.value} suffix={s.suffix} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {s.label}
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </ScrollReveal>
            </div>
            <HeroPhotoCollage photos={photos} />
          </div>
        </div>
      </section>

      {/* MARQUEE — лента фото между секциями */}
      {photos.length > 0 && (
        <section className="py-6">
          <PhotoMarquee photos={photos} speed={70} />
        </section>
      )}

      {/* СНО ЭТО... */}
      <section className="container py-20 md:py-28">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="secondary" className="rounded-full">
              О сообществе
            </Badge>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">
              СНО ОмГУПС — это <span className="text-gradient">больше чем кружок</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Четыре направления, в которых вы развиваетесь, став частью общества.
            </p>
          </div>
        </ScrollReveal>
        <StaggerContainer className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {sno_essence.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <TiltCard intensity={6}>
                  <div className="group relative rounded-3xl border border-border/60 bg-white p-6 h-full shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow overflow-hidden">
                    <div
                      className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
                    />
                    <div
                      className={`relative inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-soft`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="relative mt-4 font-semibold text-lg">{item.title}</h3>
                    <p className="relative mt-2 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* GALLERY SHOWCASE — мозаика жизни СНО */}
      {photos.length > 0 && (
        <section className="container py-12 md:py-20">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <Badge variant="secondary" className="rounded-full">
                  <Camera className="h-3 w-3 mr-1" />
                  Жизнь СНО ОмГУПС
                </Badge>
                <h2 className="mt-3 text-4xl md:text-5xl font-bold">
                  Моменты, которые мы <span className="text-gradient">создаём</span>
                </h2>
              </div>
              <p className="text-muted-foreground max-w-md">
                Заседания, конференции, лаборатории, награждения — фото говорят
                лучше слов.
              </p>
            </div>
          </ScrollReveal>
          <GalleryShowcase photos={photos} />
        </section>
      )}

      {/* НОВОСТИ */}
      <section className="container py-20">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <Badge variant="secondary" className="rounded-full">
                Свежее
              </Badge>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold">
                Последние <span className="text-gradient">новости</span>
              </h2>
            </div>
            <Link
              href="/news"
              className="text-sm font-medium text-[#8A4DFF] hover:underline flex items-center gap-1"
            >
              Все новости <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((n) => (
            <StaggerItem key={n.id}>
              <Link href={`/news/${n.id}`} className="block group h-full">
                <TiltCard intensity={5} className="h-full">
                  <Card className="overflow-hidden h-full border-border/60 transition-all duration-300 group-hover:shadow-glow">
                    {n.coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={n.coverUrl}
                        alt={n.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 gradient-brand-soft flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-[#8A4DFF]/60" />
                      </div>
                    )}
                  
                    <CardHeader>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(n.publishedAt)}
                      </div>
                      <CardTitle className="text-lg group-hover:text-[#5144B0] transition-colors">
                        {n.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground line-clamp-3">
                      {n.content}
                    </CardContent>
                  </Card>
                </TiltCard>
              </Link>
            </StaggerItem>
          ))}
          {newsList.length === 0 && (
            <p className="text-muted-foreground col-span-full">Новостей пока нет.</p>
          )}
        </StaggerContainer>
      </section>

      {/* MARQUEE — обратная лента фото */}
      {photos.length > 0 && (
        <section className="py-6">
          <PhotoMarquee photos={[...photos].reverse()} speed={80} reverse />
        </section>
      )}

      {/* ПРЕДСТОЯЩИЕ МЕРОПРИЯТИЯ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-brand-soft -z-10" />
        <BlobBackground variant="soft" className="-z-10" />
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="secondary" className="rounded-full bg-white/70">
                  Календарь
                </Badge>
                <h2 className="mt-3 text-4xl md:text-5xl font-bold">
                  Ближайшие <span className="text-gradient">события</span>
                </h2>
              </div>
              <Link
                href="/events"
                className="text-sm font-medium text-[#8A4DFF] hover:underline flex items-center gap-1"
              >
                Все мероприятия <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.slice(0, 4).map((e) => (
              <StaggerItem key={e.id}>
                <Link href={`/events/${e.id}`} className="block group h-full">
                  <TiltCard intensity={4} className="h-full">
                    <div className="h-full rounded-3xl glass-strong border border-white/60 p-6 shadow-soft transition-all duration-300 group-hover:shadow-glow">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant={e.type === "conference" ? "default" : "secondary"}
                          className="rounded-full"
                        >
                          {e.type === "conference" ? "Конференция" : "Мероприятие"}
                        </Badge>
                        <div className="text-right text-xs text-muted-foreground">
                          {formatDate(e.startDate)}
                        </div>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold group-hover:text-[#5144B0] transition-colors">
                        {e.title}
                      </h3>
                      {e.location && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          📍 {e.location}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {e.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#8A4DFF]">
                        Подробнее
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </StaggerItem>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-muted-foreground col-span-full">
                Пока нет запланированных мероприятий.
              </p>
            )}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[2rem] gradient-brand p-10 md:p-16 text-white shadow-glow">
            <div className="absolute inset-0 bg-noise opacity-50" />
            <div className="relative max-w-3xl">
              <Sparkles className="h-10 w-10 mb-4" />
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Готовы стать частью научного сообщества?
              </h2>
              <p className="mt-4 text-white/80 text-lg">
                Заявку рассмотрим за несколько дней. Никакого формализма — главное
                ваш интерес к науке.
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="mt-6 rounded-full px-7 group bg-white text-[#5144B0] hover:bg-white/90"
              >
                <Link href="/apply">
                  Подать заявку
                  <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-30">
              <GraduationCap className="h-64 w-64" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="container pb-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary" className="rounded-full">
              Вопросы и ответы
            </Badge>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">
              Часто <span className="text-gradient">спрашивают</span>
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal>  
          <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-white p-2 shadow-soft">
            <Accordion type="single" collapsible className="px-4">
              {faqList.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={String(f.id)}
                  className="last:border-0"
                >
                  <AccordionTrigger className="hover:no-underline text-left">
                    <span className="text-base font-medium">{f.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
