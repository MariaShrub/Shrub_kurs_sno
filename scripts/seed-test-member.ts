import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/server/db";
import { auth } from "../src/server/auth";
import { member, user } from "../src/server/db/schema";

async function main() {
  const email = "member@sno.local";
  const password = "member123";

  let userId: string;
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`✓ User уже существует: ${email}`);
  } else {
    const signUp = await auth.api.signUpEmail({
      body: { email, password, name: "Анна Иванова" },
    });
    if (!signUp.user) throw new Error("Не удалось создать user");
    userId = signUp.user.id;
    console.log(`✓ User создан: ${email} / ${password}`);
  }

  const [existingMember] = await db
    .select()
    .from(member)
    .where(eq(member.firstName, "Анна"))
    .limit(1);

  let memberId: string;
  if (existingMember) {
    memberId = existingMember.id;
    if (existingMember.userId !== userId) {
      await db
        .update(member)
        .set({ userId })
        .where(eq(member.id, existingMember.id));
    }
    console.log(`✓ Member «Иванова Анна» привязан к user`);
  } else {
    const [created] = await db
      .insert(member)
      .values({
        firstName: "Анна",
        lastName: "Иванова",
        position: "Председатель",
        institute: "Институт информационных технологий",
        course: 4,
        bio: "Машинное обучение и обработка естественного языка.",
        achievements: "Победитель Всероссийской олимпиады 2024.",
        socialLinks: { email },
        userId,
      })
      .returning();
    memberId = created.id;
    console.log(`✓ Member создан и привязан`);
  }

  console.log("\nДемо-аккаунт участника:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  → войти: http://localhost:3000/login`);
  console.log(`  → кабинет: http://localhost:3000/cabinet`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
