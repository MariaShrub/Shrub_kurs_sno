import { and, asc, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { event } from "@/server/db/schema";
import { eventInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export const eventsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          type: z.enum(["event", "conference"]).optional(),
          upcomingOnly: z.boolean().optional(),
          publishedOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const filters = [];
      if (input?.type) filters.push(eq(event.type, input.type));
      if (input?.upcomingOnly) filters.push(gte(event.startDate, new Date()));
      if (input?.publishedOnly !== false)
        filters.push(eq(event.isPublished, true));
      return ctx.db
        .select()
        .from(event)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(input?.upcomingOnly ? asc(event.startDate) : desc(event.startDate));
    }),

  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(event)
        .where(eq(event.id, input))
        .limit(1);
      return row ?? null;
    }),

  bySlug: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(event)
        .where(eq(event.slug, input))
        .limit(1);
      return row ?? null;
    }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(event).orderBy(desc(event.startDate));
  }),

  create: adminProcedure
    .input(eventInputSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
      const [row] = await ctx.db
        .insert(event)
        .values({
          ...input,
          slug,
          location: input.location || null,
          coverUrl: input.coverUrl || null,
          endDate: input.endDate ?? null,
          sections: input.sections ?? [],
        })
        .returning();
      return row;
    }),

  update: adminProcedure
    .input(eventInputSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(event)
        .set({
          ...rest,
          location: rest.location || null,
          coverUrl: rest.coverUrl || null,
          endDate: rest.endDate ?? null,
          sections: rest.sections ?? [],
        })
        .where(eq(event.id, id))
        .returning();
      return row;
    }),

  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(event).where(eq(event.id, input));
      return { ok: true };
    }),
});
