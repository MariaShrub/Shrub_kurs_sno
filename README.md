# Веб-приложение Студенческого Научного Общества (СНО)

Курсовая работа: клиент-серверное веб-приложение для автоматизации деятельности
студенческого научного общества.

## Стек технологий

### Frontend
- **TypeScript** — строгая типизация end-to-end
- **Next.js 16** (App Router, RSC, Turbopack)
- **React 19**
- **Zustand** — глобальное состояние (фильтры состава) без prop-drilling
- **Tailwind CSS** + **shadcn/ui** + **framer-motion** — стилизация и анимации

### Backend
- **tRPC v11** — типобезопасный API без OpenAPI/REST-схем
- **Better-auth** — аутентификация с поддержкой ролей
- **Drizzle ORM** + **PostgreSQL** — работа с БД, типизированные миграции

### Дополнительно
- **React Hook Form** + **Zod** — единая схема валидации client + server
- **react-email** + **nodemailer** — типобезопасные шаблоны писем 
- **Playwright** — E2E тесты

---

## Возможности по ролям

### 👤 Гость (без аккаунта)
- Главная с hero-коллажем фото, статистикой и FAQ
- **Состав СНО** с фильтрами по институту и курсу, детальная карточка участника
- **Мероприятия и конференции** — предстоящие и прошедшие
- **Новости** и **фотогалерея**
- **Подача заявки** на вступление в СНО
- **Запись на конференцию** (выбор секции, тема и аннотация доклада)
- **Поиграть в игру**

### 🎓 Участник СНО (роль `user`)
Аккаунт создаётся автоматически при одобрении заявки. Временный пароль приходит на email.
- Всё что доступно гостю
- **Личный кабинет** `/cabinet`:
  - Редактирование своего профиля (био, достижения, фото, соцсети)
  - История заявок на конференции со статусами и комментариями админа
  - Смена пароля
- **Упрощённая запись** на конференцию (одна кнопка вместо длинной формы)
- Защита от двойной записи на одно событие

### 🛡️ Администратор (роль `admin`)
- Дашборд `/admin` со счётчиками
- **Обработка заявок** — на вступление и на конференции, с email-уведомлениями
- При одобрении заявки на вступление автоматически:
  - создаётся карточка участника в составе СНО
  - создаётся auth-аккаунт с временным паролем
  - отправляется письмо с данными для входа
- **CRUD** мероприятий, новостей, участников, фотогалереи
- **Загрузка изображений** через UI (локально → `public/uploads/`)
- **Отчёт по активности участников** + экспорт в CSV

---
На главной странице есть возможность поиграть в игровом боте три игры на выбор (игра в города, сканворд, научный спринт(тест на скорость)) и  включить музыкальное  сопровождение
### Шаги

```bash
# 1. Установить зависимости
pnpm install

# 2. Поднять Postgres 
docker compose up -d

# 3. Применить миграции
pnpm db:migrate

# 4. Сидинг (создаст админа и демо-данные)
pnpm db:seed

# 5. Dev-сервер
pnpm dev
```

Открыть:
- **Сайт**: http://localhost:3000
- **Вход**: http://localhost:3000/login
  - Админ: `admin@sno.local` / `admin123`
  - Участник: `member@sno.local` / `member123`

---


# Тесты
pnpm test:e2e          # Playwright headless
pnpm test:e2e:ui       # Playwright UI (наглядно)

Покрытие (7 сценариев):
- **public-flow.spec.ts** — главная → состав → форма заявки + защита `/admin` от анонимов
- **admin-flow.spec.ts** — логин админа → одобрение заявки → проверка статуса в БД → авто-создание участника
- **cabinet-flow.spec.ts** — вход участника → подача заявки на конференцию → отображение в кабинете

Все 7 тестов зелёные за ~45 секунд.

## Структура проекта

```
src/
├── app/
│   ├── (public)/             # Публичные маршруты
│   │   ├── page.tsx          #   главная
│   │   ├── members/          #   состав
│   │   ├── events/           #   мероприятия и конференции
│   │   ├── news/             #   новости
│   │   ├── gallery/          #   фотогалерея
│   │   └── apply/            #   форма заявки на вступление
│   ├── admin/(protected)/    # Админка (требует роль admin)
│   ├── cabinet/              # Кабинет участника (требует auth)
│   ├── login/                # Единая страница входа со смарт-редиректом
│   └── api/
│       ├── trpc/[trpc]/      # tRPC handler
│       ├── auth/[...all]/    # better-auth handler
│       └── upload/           # POST загрузка фото (admin only)
├── server/
│   ├── db/
│   │   ├── schema.ts         # Drizzle: 11 таблиц с типами
│   │   ├── seed.ts           # сидинг
│   │   └── index.ts          # клиент Postgres-js (с pgBouncer-настройками)
│   ├── auth.ts               # better-auth + smart base-URL для Vercel
│   ├── email.ts              # nodemailer transport
│   └── api/
│       ├── trpc.ts           # context, procedures (public/authed/admin)
│       ├── root.ts           # объединённый AppRouter
│       └── routers/          # 8 роутеров (members, events, news, ...)
├── lib/
│   ├── trpc/                 # клиент + server-side caller
│   ├── auth-client.ts        # better-auth React-клиент с inferAdditionalFields
│   ├── validators.ts         # Zod-схемы (используются и на client, и на server)
│   └── utils.ts
├── components/
│   ├── ui/                   # shadcn/ui примитивы
│   ├── layout/               # Header, Footer, AdminSidebar, UserMenu
│   ├── home/                 # HeroPhotoCollage, PhotoMarquee, GalleryShowcase
│   ├── members/              # карточка и фильтры состава
│   ├── gallery/              # GalleryGrid с лайтбоксом
│   ├── forms/                # формы заявок + GuestOnly/FormGate
│   ├── cabinet/              # ProfileEditor, ConferenceApplicationsList
│   └── admin/                # ImageUploader, диалоги CRUD
├── stores/                   # Zustand (фильтры участников)
├── emails/                   # react-email шаблоны
├── middleware.ts             # защита /admin/* и /cabinet/*
└── styles/globals.css

drizzle/                       # SQL-миграции
tests/e2e/                     # Playwright (3 файла, 7 сценариев)
scripts/                       # утилиты для seed / SMTP / passwords
public/uploads/                # локальное хранилище загрузок (gitignored)
docs/                          # подробная документация
```

---

## Схема БД (7 доменных сущностей + auth-таблицы)

| Таблица | Назначение |
|---|---|
| `user`, `session`, `account`, `verification` | Better-auth (с полем `role: 'admin' \| 'user'`) |
| `member` | Участники СНО (со ссылкой `user_id` → `user.id`) |
| `event` | Мероприятия и конференции (`type`, `sections[]`) |
| `join_application` | Заявки на вступление (со ссылкой `member_id`) |
| `conference_application` | Заявки на конференции |
| `news` | Новости |
| `gallery_photo` | Фотогалерея |
| `faq` | Вопрос-ответ для главной |


---


## Защита и безопасность

- **Роли**: `admin`, `user`. Поле `role` хранится в `user`, проверяется на server (tRPC adminProcedure / authedProcedure) и в layouts (server-side `auth.api.getSession`).
- **Middleware** защищает `/admin/*` и `/cabinet/*` cookie-проверкой; глубокая проверка роли — в layout.
- **CSRF**: better-auth `trustedOrigins` настроен на `BETTER_AUTH_URL` в prod и любой `localhost:*` в dev.
- **Загрузка файлов**: только admin, проверка MIME (`image/jpeg|png|webp|gif`) и размера (10MB).
- **Дубликаты заявок** на одну конференцию пресекаются на server (CONFLICT 409).
- **Пароль участника** при одобрении заявки: 12 символов из безопасного набора, хешируется через better-auth и приходит на email.

---


