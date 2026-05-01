import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { galleryPhoto } from "@/server/db/schema";
import { galleryPhotoSchema } from "@/lib/validators";

export const galleryRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ eventId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const q = ctx.db.select().from(galleryPhoto);
      if (input?.eventId) {
        return q
          .where(eq(galleryPhoto.eventId, input.eventId))
          .orderBy(desc(galleryPhoto.uploadedAt));
      }
      return q.orderBy(desc(galleryPhoto.uploadedAt));
    }),

  create: adminProcedure
    .input(galleryPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(galleryPhoto)
        .values({
          url: input.url,
          caption: input.caption || null,
          eventId: input.eventId || null,
        })
        .returning();
      return row;
    }),

  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(galleryPhoto).where(eq(galleryPhoto.id, input));
      return { ok: true };
    }),
});
