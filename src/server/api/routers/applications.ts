import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { render } from "@react-email/render";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import {
  conferenceApplication,
  event,
  joinApplication,
  member,
} from "@/server/db/schema";
import {
  conferenceApplicationSchema,
  joinApplicationSchema,
  statusUpdateSchema,
} from "@/lib/validators";
import { sendEmail } from "@/server/email";
import { auth } from "@/server/auth";
import { account, user } from "@/server/db/schema";
import { JoinApplicationEmail } from "@/emails/application-status";
import { ConferenceApplicationEmail } from "@/emails/conference-status";
import { ApplicationReceivedEmail } from "@/emails/application-received";
import { MemberInviteEmail } from "@/emails/member-invite";

function generatePassword() {
  const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += charset[Math.floor(Math.random() * charset.length)];
  }
  return out;
}

export const applicationsRouter = createTRPCRouter({
  submitJoin: publicProcedure
    .input(joinApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(joinApplication)
        .values({
          ...input,
          phone: input.phone || null,
        })
        .returning();
      try {
        const html = await render(
          ApplicationReceivedEmail({ firstName: row.firstName, kind: "join" }),
        );
        await sendEmail({
          to: row.email,
          subject: "Мы получили вашу заявку в СНО",
          html,
        });
      } catch (e) {
        console.error("Confirmation email failed:", e);
      }
      return row;
    }),

  listJoin: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "approved", "rejected"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const filter = input?.status
        ? eq(joinApplication.status, input.status)
        : undefined;
      return ctx.db
        .select()
        .from(joinApplication)
        .where(filter)
        .orderBy(desc(joinApplication.createdAt));
    }),

  updateJoinStatus: adminProcedure
    .input(statusUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(joinApplication)
        .set({
          status: input.status,
          reviewerNote: input.reviewerNote || null,
          reviewedAt: new Date(),
        })
        .where(eq(joinApplication.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      let invitePassword: string | null = null;

      if (input.status === "approved") {
        invitePassword = generatePassword();

        const [existingUser] = await ctx.db
          .select()
          .from(user)
          .where(eq(user.email, row.email))
          .limit(1);

        let userId: string;
        if (existingUser) {
          userId = existingUser.id;
          const authCtx = await auth.$context;
          const hashed = await authCtx.password.hash(invitePassword);
          await ctx.db
            .update(account)
            .set({ password: hashed })
            .where(eq(account.userId, existingUser.id));
        } else {
          const signUp = await auth.api.signUpEmail({
            body: {
              email: row.email,
              password: invitePassword,
              name: `${row.firstName} ${row.lastName}`,
            },
          });
          if (!signUp.user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Не удалось создать учётную запись",
            });
          }
          userId = signUp.user.id;
        }

        if (!row.memberId) {
          const [newMember] = await ctx.db
            .insert(member)
            .values({
              firstName: row.firstName,
              lastName: row.lastName,
              position: "Член СНО",
              institute: row.institute,
              course: row.course,
              socialLinks: { email: row.email },
              userId,
            })
            .returning();
          await ctx.db
            .update(joinApplication)
            .set({ memberId: newMember.id })
            .where(eq(joinApplication.id, row.id));
        } else {
          await ctx.db
            .update(member)
            .set({ userId })
            .where(eq(member.id, row.memberId));
        }
      }

      try {
        if (row.status === "approved" && invitePassword) {
          const baseUrl =
            process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
          const html = await render(
            MemberInviteEmail({
              firstName: row.firstName,
              email: row.email,
              password: invitePassword,
              loginUrl: `${baseUrl}/login`,
            }),
          );
          await sendEmail({
            to: row.email,
            subject: "Добро пожаловать в СНО — доступ в личный кабинет",
            html,
          });
          console.log(
            `[approve] invite email sent to ${row.email}, new password generated`,
          );
        } else {
          const html = await render(
            JoinApplicationEmail({
              firstName: row.firstName,
              status: row.status,
              note: row.reviewerNote ?? null,
            }),
          );
          await sendEmail({
            to: row.email,
            subject:
              row.status === "approved"
                ? "Ваша заявка в СНО одобрена"
                : "Решение по заявке в СНО",
            html,
          });
        }
      } catch (e) {
        console.error("Email send failed:", e);
      }
      return row;
    }),

  submitConference: publicProcedure
    .input(conferenceApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const [ev] = await ctx.db
        .select()
        .from(event)
        .where(eq(event.id, input.eventId))
        .limit(1);
      if (!ev || ev.type !== "conference") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Конференция не найдена",
        });
      }
      if (ev.sections.length && !ev.sections.includes(input.section)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Секция не существует",
        });
      }
      const [existing] = await ctx.db
        .select()
        .from(conferenceApplication)
        .where(
          and(
            eq(conferenceApplication.eventId, input.eventId),
            eq(conferenceApplication.email, input.email),
          ),
        )
        .limit(1);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Вы уже подавали заявку на эту конференцию",
        });
      }
      const [row] = await ctx.db
        .insert(conferenceApplication)
        .values({
          ...input,
          phone: input.phone || null,
          abstract: input.abstract || null,
        })
        .returning();
      try {
        const html = await render(
          ApplicationReceivedEmail({
            firstName: row.firstName,
            kind: "conference",
            eventTitle: ev.title,
            topic: row.topic,
          }),
        );
        await sendEmail({
          to: row.email,
          subject: `Мы получили вашу заявку на «${ev.title}»`,
          html,
        });
      } catch (e) {
        console.error("Confirmation email failed:", e);
      }
      return row;
    }),

  listConference: adminProcedure
    .input(
      z
        .object({
          eventId: z.string().uuid().optional(),
          status: z.enum(["pending", "approved", "rejected"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const filters = [];
      if (input?.eventId)
        filters.push(eq(conferenceApplication.eventId, input.eventId));
      if (input?.status)
        filters.push(eq(conferenceApplication.status, input.status));
      return ctx.db
        .select({
          app: conferenceApplication,
          event: event,
        })
        .from(conferenceApplication)
        .leftJoin(event, eq(conferenceApplication.eventId, event.id))
        .where(filters.length ? filters[0] : undefined)
        .orderBy(desc(conferenceApplication.createdAt));
    }),

  updateConferenceStatus: adminProcedure
    .input(statusUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(conferenceApplication)
        .set({
          status: input.status,
          reviewerNote: input.reviewerNote || null,
          reviewedAt: new Date(),
        })
        .where(eq(conferenceApplication.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      const [ev] = await ctx.db
        .select()
        .from(event)
        .where(eq(event.id, row.eventId))
        .limit(1);
      try {
        const html = await render(
          ConferenceApplicationEmail({
            firstName: row.firstName,
            eventTitle: ev?.title ?? "Конференция",
            section: row.section,
            topic: row.topic,
            status: row.status,
            note: row.reviewerNote ?? null,
          }),
        );
        await sendEmail({
          to: row.email,
          subject:
            row.status === "approved"
              ? `Заявка на конференцию «${ev?.title ?? ""}» одобрена`
              : `Решение по заявке на конференцию «${ev?.title ?? ""}»`,
          html,
        });
      } catch (e) {
        console.error("Email send failed:", e);
      }
      return row;
    }),
});
