import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { faq } from "@/server/db/schema";
import { faqSchema } from "@/lib/validators";

export const faqRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(faq).orderBy(asc(faq.sortOrder));
  }),

  create: adminProcedure
    .input(faqSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(faq).values(input).returning();
      return row;
    }),

  update: adminProcedure
    .input(faqSchema.extend({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(faq)
        .set(rest)
        .where(eq(faq.id, id))
        .returning();
      return row;
    }),

  delete: adminProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(faq).where(eq(faq.id, input));
      return { ok: true };
    }),
});
