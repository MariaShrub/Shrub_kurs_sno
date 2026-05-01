import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  authedProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import {
  conferenceApplication,
  event,
  member,
} from "@/server/db/schema";
import { auth } from "@/server/auth";

export const cabinetRouter = createTRPCRouter({
  myProfile: authedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(member)
      .where(eq(member.userId, ctx.user.id))
      .limit(1);
    return row ?? null;
  }),

  updateMyProfile: authedProcedure
    .input(
      z.object({
        bio: z.string().max(2000).optional().nullable(),
        achievements: z.string().max(2000).optional().nullable(),
        photoUrl: z
          .string()
          .max(2048)
          .refine(
            (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
            "Неверный путь",
          )
          .optional()
          .nullable()
          .or(z.literal("")),
        socialLinks: z
          .object({
            telegram: z.string().optional().or(z.literal("")),
            vk: z.string().optional().or(z.literal("")),
            email: z.string().email().optional().or(z.literal("")),
          })
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(member)
        .where(eq(member.userId, ctx.user.id))
        .limit(1);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Карточка участника не найдена",
        });
      }
      const [row] = await ctx.db
        .update(member)
        .set({
          bio: input.bio ?? null,
          achievements: input.achievements ?? null,
          photoUrl: input.photoUrl || null,
          socialLinks: input.socialLinks ?? null,
        })
        .where(eq(member.id, existing.id))
        .returning();
      return row;
    }),

  myApplicationForEvent: authedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(conferenceApplication)
        .where(
          and(
            eq(conferenceApplication.eventId, input.eventId),
            eq(conferenceApplication.email, ctx.user.email),
          ),
        )
        .limit(1);
      return row ?? null;
    }),

  myConferenceApplications: authedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({ app: conferenceApplication, event })
      .from(conferenceApplication)
      .leftJoin(event, eq(conferenceApplication.eventId, event.id))
      .where(eq(conferenceApplication.email, ctx.user.email))
      .orderBy(desc(conferenceApplication.createdAt));
  }),

  changePassword: authedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, "Минимум 6 символов"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await auth.api.changePassword({
          headers: ctx.headers,
          body: {
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
            revokeOtherSessions: false,
          },
        });
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            (e as Error).message ?? "Не удалось сменить пароль",
        });
      }
      return { ok: true };
    }),
});
