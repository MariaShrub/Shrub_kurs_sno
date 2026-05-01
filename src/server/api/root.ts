import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { membersRouter } from "@/server/api/routers/members";
import { eventsRouter } from "@/server/api/routers/events";
import { applicationsRouter } from "@/server/api/routers/applications";
import { newsRouter } from "@/server/api/routers/news";
import { galleryRouter } from "@/server/api/routers/gallery";
import { faqRouter } from "@/server/api/routers/faq";
import { reportsRouter } from "@/server/api/routers/reports";
import { cabinetRouter } from "@/server/api/routers/cabinet";

export const appRouter = createTRPCRouter({
  members: membersRouter,
  events: eventsRouter,
  applications: applicationsRouter,
  news: newsRouter,
  gallery: galleryRouter,
  faq: faqRouter,
  reports: reportsRouter,
  cabinet: cabinetRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
