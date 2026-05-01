import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";


function resolveBaseURL(): string {
  const explicit = process.env.BETTER_AUTH_URL;
  if (explicit && /^https?:\/\//.test(explicit)) return explicit;

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const deploy = process.env.VERCEL_URL;
  if (deploy) return `https://${deploy}`;

  return "http://localhost:3000";
}

const baseURL = resolveBaseURL();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // нельзя выставить с фронта
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 дней
    updateAge: 60 * 60 * 24, // обновлять каждые 24ч
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: (request) => {
    const list = [baseURL];
    if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      list.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    }

    if (process.env.NODE_ENV !== "production") {
      const origin = request?.headers.get("origin");
      list.push("http://localhost:3000");
      if (origin && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        list.push(origin);
      }
    }
    return Array.from(new Set(list));
  },
});

export type Auth = typeof auth;
