import { sql } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
} from "@/server/api/trpc";
import { conferenceApplication, member } from "@/server/db/schema";

export const reportsRouter = createTRPCRouter({
  summary: adminProcedure.query(async ({ ctx }) => {
    const [{ count: membersCount }] = await ctx.db.execute<{ count: number }>(
      sql`select count(*)::int as count from ${member}`,
    );
    const [{ count: pendingJoin }] = await ctx.db.execute<{ count: number }>(
      sql`select count(*)::int as count from join_application where status = 'pending'`,
    );
    const [{ count: pendingConference }] = await ctx.db.execute<{
      count: number;
    }>(
      sql`select count(*)::int as count from conference_application where status = 'pending'`,
    );
    const [{ count: eventsCount }] = await ctx.db.execute<{ count: number }>(
      sql`select count(*)::int as count from event where start_date >= now()`,
    );
    return {
      membersCount,
      pendingJoin,
      pendingConference,
      upcomingEvents: eventsCount,
    };
  }),

  activity: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.execute<{
      member_id: string;
      first_name: string;
      last_name: string;
      institute: string;
      course: number;
      conferences: number;
    }>(sql`
      select m.id as member_id, m.first_name, m.last_name, m.institute, m.course,
             coalesce(c.cnt, 0)::int as conferences
      from member m
      left join (
        select first_name, last_name, count(*)::int as cnt
        from ${conferenceApplication}
        where status = 'approved'
        group by first_name, last_name
      ) c on c.first_name = m.first_name and c.last_name = m.last_name
      order by conferences desc, m.last_name
    `);
    return rows;
  }),
});
