import { and, asc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { member } from "@/server/db/schema";
import {
  memberFiltersSchema,
  memberInputSchema,
} from "@/lib/validators";

export const membersRouter = createTRPCRouter({
  list: publicProcedure
    .input(memberFiltersSchema.optional())
    .query(async ({ ctx, input }) => {
      const filters = [];
      if (input?.institute) filters.push(eq(member.institute, input.institute));
      if (input?.course) filters.push(eq(member.course, input.course));
      if (input?.search) {
        const q = `%${input.search}%`;
        filters.push(
          or(
            ilike(member.firstName, q),
            ilike(member.lastName, q),
            ilike(member.position, q),
          )!,
        );
      }
      return ctx.db
        .select()
        .from(member)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(asc(member.lastName));
    }),

  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(member)
        .where(eq(member.id, input))
        .limit(1);
      return row ?? null;
    }),

  institutes: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ institute: member.institute })
      .from(member);
    return rows.map((r) => r.institute).sort();
  }),

  create: adminProcedure
    .input(memberInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(member)
        .values({
          ...input,
          photoUrl: input.photoUrl || null,
          bio: input.bio || null,
          achievements: input.achievements || null,
          socialLinks: input.socialLinks ?? null,
        })
        .returning();
      return row;
    }),

  update: adminProcedure
    .input(memberInputSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(member)
        .set({
          ...rest,
          photoUrl: rest.photoUrl || null,
          bio: rest.bio || null,
          achievements: rest.achievements || null,
          socialLinks: rest.socialLinks ?? null,
        })
        .where(eq(member.id, id))
        .returning();
      return row;
    }),

  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(member).where(eq(member.id, input));
      return { ok: true };
    }),
});
