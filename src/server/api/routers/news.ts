import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { news } from "@/server/db/schema";
import { newsInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export const newsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const q = ctx.db
        .select()
        .from(news)
        .where(eq(news.isPublished, true))
        .orderBy(desc(news.publishedAt));
      if (input?.limit) return q.limit(input.limit);
      return q;
    }),

  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(news)
        .where(and(eq(news.id, input), eq(news.isPublished, true)))
        .limit(1);
      return row ?? null;
    }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(news).orderBy(desc(news.publishedAt));
  }),

  adminById: adminProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(news)
        .where(eq(news.id, input))
        .limit(1);
      return row ?? null;
    }),

  create: adminProcedure
    .input(newsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
      const [row] = await ctx.db
        .insert(news)
        .values({
          ...input,
          slug,
          coverUrl: input.coverUrl || null,
        })
        .returning();
      return row;
    }),

  update: adminProcedure
    .input(newsInputSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(news)
        .set({ ...rest, coverUrl: rest.coverUrl || null })
        .where(eq(news.id, id))
        .returning();
      return row;
    }),

  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(news).where(eq(news.id, input));
      return { ok: true };
    }),
});
