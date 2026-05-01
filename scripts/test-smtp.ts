import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
  const host = process.env.SMTP_HOST ?? "localhost";
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const user = process.env.SMTP_USER || undefined;
  const pass = process.env.SMTP_PASS || undefined;
  const from = process.env.SMTP_FROM ?? "test <noreply@local>";
  const to = process.argv[2] ?? user;

  if (!to) {
    console.error("Не указан получатель и не задан SMTP_USER.");
    process.exit(1);
  }

  console.log(`→ ${host}:${port}, secure=${port === 465}, user=${user}`);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  try {
    await transport.verify();
    console.log("✓ verify() OK — авторизация на SMTP прошла");
  } catch (e) {
    console.error("✗ verify() failed:", e);
    process.exit(1);
  }

  const info = await transport.sendMail({
    from,
    to,
    subject: "Тест SMTP — СНО",
    text: "Это тестовое письмо от приложения СНО.",
    html: "<p>Это <b>тестовое</b> письмо от приложения СНО. SMTP настроен корректно.</p>",
  });
  console.log("✓ Письмо отправлено:", info.messageId);
  console.log(`  → проверьте ${to}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
