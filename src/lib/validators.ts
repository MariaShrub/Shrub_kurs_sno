import { z } from "zod";

const imagePath = z
  .string()
  .max(2048)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
    "Должен быть URL или путь, начинающийся с /",
  );

export const memberInputSchema = z.object({
  firstName: z.string().min(1, "Укажите имя").max(50),
  lastName: z.string().min(1, "Укажите фамилию").max(50),
  photoUrl: imagePath.optional().nullable().or(z.literal("")),
  position: z.string().min(1, "Укажите должность").max(80),
  institute: z.string().min(1, "Укажите институт").max(120),
  course: z.coerce.number().int().min(1).max(6),
  bio: z.string().max(2000).optional().nullable().or(z.literal("")),
  achievements: z.string().max(2000).optional().nullable().or(z.literal("")),
  socialLinks: z
    .object({
      telegram: z.string().optional().or(z.literal("")),
      vk: z.string().optional().or(z.literal("")),
      email: z.string().email().optional().or(z.literal("")),
    })
    .optional()
    .nullable(),
});
export type MemberInput = z.infer<typeof memberInputSchema>;

export const eventInputSchema = z.object({
  title: z.string().min(1, "Укажите название").max(200),
  description: z.string().min(1, "Укажите описание"),
  type: z.enum(["event", "conference"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  location: z.string().max(200).optional().nullable().or(z.literal("")),
  coverUrl: imagePath.optional().nullable().or(z.literal("")),
  sections: z.array(z.string().min(1)).default([]),
  isPublished: z.boolean().default(true),
});
export type EventInput = z.infer<typeof eventInputSchema>;

export const newsInputSchema = z.object({
  title: z.string().min(1, "Укажите заголовок").max(200),
  content: z.string().min(1, "Заполните текст новости"),
  coverUrl: imagePath.optional().nullable().or(z.literal("")),
  isPublished: z.boolean().default(true),
});
export type NewsInput = z.infer<typeof newsInputSchema>;

export const joinApplicationSchema = z.object({
  firstName: z.string().min(1, "Укажите имя").max(50),
  lastName: z.string().min(1, "Укажите фамилию").max(50),
  email: z.string().email("Неверный email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  institute: z.string().min(1, "Укажите институт").max(120),
  course: z.coerce.number().int().min(1).max(6),
  motivation: z
    .string()
    .min(20, "Расскажите о себе хотя бы в 20 символах")
    .max(2000),
});
export type JoinApplicationInput = z.infer<typeof joinApplicationSchema>;

export const conferenceApplicationSchema = z.object({
  eventId: z.string().uuid(),
  firstName: z.string().min(1, "Укажите имя").max(50),
  lastName: z.string().min(1, "Укажите фамилию").max(50),
  email: z.string().email("Неверный email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  section: z.string().min(1, "Выберите секцию"),
  topic: z.string().min(1, "Укажите тему доклада").max(300),
  abstract: z.string().max(3000).optional().or(z.literal("")),
});
export type ConferenceApplicationInput = z.infer<
  typeof conferenceApplicationSchema
>;

export const galleryPhotoSchema = z.object({
  url: imagePath,
  caption: z.string().max(200).optional().or(z.literal("")),
  eventId: z.string().uuid().optional().nullable(),
});

export const faqSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
  sortOrder: z.coerce.number().int().default(0),
});

export const memberFiltersSchema = z.object({
  institute: z.string().optional(),
  course: z.coerce.number().int().min(1).max(6).optional(),
  search: z.string().optional(),
});

export const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reviewerNote: z.string().max(1000).optional().or(z.literal("")),
});
