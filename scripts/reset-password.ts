import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/server/db";
import { auth } from "../src/server/auth";
import { account, user } from "../src/server/db/schema";

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error(
      "Использование: pnpm tsx scripts/reset-password.ts <email> <newPassword>",
    );
    process.exit(1);
  }
  if (newPassword.length < 6) {
    console.error("Пароль должен быть минимум 6 символов");
    process.exit(1);
  }

  const [u] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (!u) {
    console.error(`Пользователь с email ${email} не найден`);
    process.exit(1);
  }

  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(newPassword);

  await db
    .update(account)
    .set({ password: hashed })
    .where(eq(account.userId, u.id));

  console.log(`✓ Пароль для ${email} сброшен.`);
  console.log(`  Войти: ${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/login`);
  console.log(`  Email: ${email}`);
  console.log(`  Пароль: ${newPassword}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
