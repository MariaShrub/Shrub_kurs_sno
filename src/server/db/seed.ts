
import "dotenv/config";
import { auth } from "../auth";
import { db } from "./index";
import {
  event,
  faq,
  galleryPhoto,
  member,
  news,
  user,
} from "./schema";
import { sql, eq } from "drizzle-orm";
import { slugify } from "../../lib/utils";

async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@sno.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const name = process.env.SEED_ADMIN_NAME ?? "Администратор СНО";

  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing) {
    if (existing.role !== "admin") {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
      console.log(`✓ Роль 'admin' установлена для ${email}`);
    } else {
      console.log(`✓ Админ ${email} уже существует`);
    }
    return existing.id;
  }


  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });
  if (!result.user) {
    throw new Error("Не удалось создать админа");
  }
  await db.update(user).set({ role: "admin" }).where(eq(user.id, result.user.id));
  console.log(`✓ Админ создан: ${email} / ${password}`);
  return result.user.id;
}

async function seedDomain() {

  await db.execute(sql`truncate table conference_application, join_application, gallery_photo, news, event, member, faq restart identity cascade`);



  const members = await db
    .insert(member)
    .values([
      {
        firstName: "Анна",
        lastName: "Иванова",
        position: "Председатель",
        institute: "Институт электрического транспорта и систем энергообеспечения",
        course: 4,
        bio: "Занимается ведением проектных команд и хочет работать в ржд",
        achievements: "Студент года 2025",
        socialLinks: { telegram: "@lilia_iv", email: "lilia@sno.local" },
      },
      {
        firstName: "Мария",
        lastName: "Шруб",
        position: "Заместитель председателя",
        institute: "Институт автоматики, телекоммуникаций и информационных технологий",
        course: 3,
        bio: "Программирует в свое удовольствие, открыта всему новому",
        achievements: "Победитель Case-In 2026",
        socialLinks: { telegram: "@masha_sh" },
      },
      {
        firstName: "Елена",
        lastName: "Смирнова",
        position: "Секретарь",
        institute: "Институт менеджмента и экономики",
        course: 2,
        bio: "Хотела бы стать мисс ОмГУПС",
        achievements: "Стипендиат Президента РФ 2024.",
        socialLinks: { vk: "elena.s" },
      },
      {
        firstName: "Дмитрий",
        lastName: "Кузнецов",
        position: "Член СНО",
        institute: "Институт электрического транспорта и систем энергообеспечения",
        course: 5,
        bio: "Машиностроение",
        achievements: "Соавтор 3 публикаций в журналах ВАК.",
      },
      {
        firstName: "Ольга",
        lastName: "Новикова",
        position: "Член СНО",
        institute: "Институт менеджмента и экономики",
        course: 3,
        bio: "Меня и там и тут показывают",
        achievements: "Грант РНФ для молодых учёных.",
      },
    ])
    .returning();
  console.log(`✓ Участников: ${members.length}`);


  const events = await db
    .insert(event)
    .values([
      {
        title: "Открытое заседание СНО ОмГУПС",
        slug: slugify("Открытое заседание СНО ОмГУПС") + "-" + Date.now().toString(36),
        description:
          "Приглашаем всех желающих на открытое заседание Студенческого Научного Общества. Обсудим планы на семестр и заслушаем доклады.",
        type: "event",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "Главный корпус, ауд. 305",
        sections: [],
        isPublished: true,
      },
      {
        title: "Школа молодого исследователя",
        slug: slugify("Школа молодого исследователя") + "-" + (Date.now() + 1).toString(36),
        description:
          "Серия лекций и мастер-классов от ведущих учёных университета.",
        type: "event",
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "СТУЦ",
        sections: [],
        isPublished: true,
      },
      {
        title: "XII Всероссийская студенческая научная конференция с международным участием «Студент: наука, профессия, жизнь»",
        slug: slugify("Студент: наука, профессия, жизнь") + "-" + (Date.now() + 2).toString(36),
        description:
          "Ежегодная конференция, объединяющая студентов и молодых учёных. Прислать заявку с темой и аннотацией доклада.",
        type: "conference",
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        location: "Главный корпус, ауд.150",
        sections: [
          "Информационные технологии",
          "Теплоэнергетика",
          "Искуственный интеллект и киберфизические системы",
          "Тяговые подстанции, энергоснабжение",
        ],
        isPublished: true,
      },
    ])
    .returning();
  console.log(`✓ Мероприятий: ${events.length}`);


  const newsRows = await db
    .insert(news)
    .values([
      {
        title: "Открыт приём заявок на конференцию «Студент: наука, профессия, жизнь»",
        slug: "open-call-naukabuduschego-" + Date.now().toString(36),
        content:
          "Открыт приём заявок на XII Всероссийскую студенческую научную конференцию с международным участием «Студент: наука, профессия, жизнь». Принимаются работы по четырём секциям. Подать заявку можно через сайт.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Студенты СНО получили награду на Всероссийском конкурсе",
        slug: "vserossiyskiy-konkurs-" + (Date.now() + 1).toString(36),
        content:
          "Команда СНО заняла первое место на Всероссийском конкурсе студенческих научных работ.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Расписание заседаний на новый семестр",
        slug: "raspisanie-" + (Date.now() + 2).toString(36),
        content:
          "Опубликовано расписание заседаний СНО на весенний семестр. Заседания проходят по средам в 18:00.",
        isPublished: true,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ])
    .returning();
  console.log(`✓ Новостей: ${newsRows.length}`);

  
  const photos = await db
    .insert(galleryPhoto)
    .values([
      {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
        caption: "Открытие научного сезона",
      },
      {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
        caption: "Заседание СНО",
      },
      {
        url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
        caption: "Лаборатория молекулярной биологии",
      },
      {
        url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
        caption: "Конференция «Наука будущего»",
      },
      {
        url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
        caption: "Школа молодого исследователя",
      },
      {
        url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&q=80",
        caption: "Награждение призёров",
      },
      {
        url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80",
        caption: "Защита проектов",
      },
      {
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
        caption: "Научная библиотека",
      },
    ])
    .returning();
  console.log(`✓ Фотографий: ${photos.length}`);

  const faqs = await db
    .insert(faq)
    .values([
      {
        question: "Кто может вступить в СНО?",
        answer:
          "Любой студент университета 1–5 курса. Достаточно подать заявку через форму на сайте.",
        sortOrder: 1,
      },
      {
        question: "Нужны ли публикации для вступления?",
        answer:
          "Нет, публикации не требуются. Главное — заинтересованность в научной работе.",
        sortOrder: 2,
      },
      {
        question: "Можно ли участвовать в конференции, не будучи членом СНО?",
        answer:
          "Да, конференции открыты для всех студентов. Заявку можно подать через сайт.",
        sortOrder: 3,
      },
      {
        question: "Как часто проводятся мероприятия?",
        answer:
          "В среднем 2–3 мероприятия в месяц: заседания, лекции, школы, конференции.",
        sortOrder: 4,
      },
    ])
    .returning();
  console.log(`✓ FAQ: ${faqs.length}`);
}

async function main() {
  console.log("→ Сидинг СНО...");
  await ensureAdmin();
  await seedDomain();
  console.log("✓ Готово");
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ Ошибка сидинга:", e);
  process.exit(1);
});
