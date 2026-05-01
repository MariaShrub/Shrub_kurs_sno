import "dotenv/config";
import { db } from "../src/server/db";
import { galleryPhoto } from "../src/server/db/schema";

const themedPhotos: { url: string; caption: string }[] = [
  {
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    caption: "Открытие научного сезона",
  },
  {
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
    caption: "Конференция «Наука будущего»",
  },
  {
    url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80",
    caption: "Пленарное заседание",
  },
  {
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80",
    caption: "Доклад на секции",
  },
  {
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    caption: "Заседание СНО",
  },
  {
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    caption: "Командная работа",
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    caption: "Обсуждение проекта",
  },
  {
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
    caption: "Лаборатория молекулярной биологии",
  },
  {
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
    caption: "Эксперимент в лаборатории",
  },
  {
    url: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=1200&q=80",
    caption: "Исследовательская работа",
  },
  {
    url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=80",
    caption: "Микроскопия",
  },
  {
    url: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1200&q=80",
    caption: "Химия и аналитика",
  },
  {
    url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
    caption: "Школа молодого исследователя",
  },
  {
    url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80",
    caption: "Студенческий семинар",
  },
  {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80",
    caption: "Защита проектов",
  },
  {
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
    caption: "Научная библиотека",
  },
  {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
    caption: "Учебная аудитория",
  },
  {
    url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&q=80",
    caption: "Награждение призёров",
  },
  {
    url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80",
    caption: "Диплом победителя",
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    caption: "Выпуск года",
  },
  {
    url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80",
    caption: "Команда СНО",
  },
  {
    url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
    caption: "Презентация исследования",
  },
];

async function main() {
  await db.delete(galleryPhoto);
  const inserted = await db
    .insert(galleryPhoto)
    .values(themedPhotos)
    .returning();
  console.log(`✓ Галерея обновлена: ${inserted.length} фото`);
  for (const p of inserted) console.log(`  - ${p.caption}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ Ошибка:", e);
  process.exit(1);
});
