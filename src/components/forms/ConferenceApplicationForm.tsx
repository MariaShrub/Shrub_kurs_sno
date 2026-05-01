"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import { authClient } from "@/lib/auth-client";
import {
  conferenceApplicationSchema,
  type ConferenceApplicationInput,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle2, Clock, Mic2, Sparkles, XCircle } from "lucide-react";

const STATUS_META = {
  pending: {
    label: "Заявка ожидает рассмотрения",
    description:
      "Администратор её проверит и пришлёт решение на email. Статус будет в личном кабинете.",
    icon: Clock,
    badgeVariant: "warning" as const,
    accent: "text-amber-700 bg-amber-50 border-amber-200",
  },
  approved: {
    label: "Заявка одобрена",
    description: "Ждём вас на конференции!",
    icon: CheckCircle2,
    badgeVariant: "success" as const,
    accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  rejected: {
    label: "Заявка отклонена",
    description: "К сожалению, ваша заявка не была одобрена.",
    icon: XCircle,
    badgeVariant: "destructive" as const,
    accent: "text-red-700 bg-red-50 border-red-200",
  },
} as const;

interface Props {
  eventId: string;
  sections: string[];
  eventTitle: string;
}

const LISTENER_TOPIC = "Слушатель (без доклада)";

export function ConferenceApplicationForm({
  eventId,
  sections,
  eventTitle,
}: Props) {
  const session = authClient.useSession();
  const isAuthed = !!session.data?.user;
  const utils = api.useUtils();

  const existing = api.cabinet.myApplicationForEvent.useQuery(
    { eventId },
    { enabled: isAuthed },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ConferenceApplicationInput>({
    resolver: zodResolver(conferenceApplicationSchema),
    defaultValues: {
      eventId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      section: sections[0] ?? "",
      topic: "",
      abstract: "",
    },
  });

  useEffect(() => {
    const u = session.data?.user;
    if (!u) return;
    const [first, ...rest] = (u.name ?? "").trim().split(" ");
    setValue("firstName", first ?? "");
    setValue("lastName", rest.join(" ") || "");
    setValue("email", u.email);
    setValue("topic", LISTENER_TOPIC);
  }, [session.data, setValue]);

  const submit = api.applications.submitConference.useMutation({
    onSuccess: () => {
      toast.success("Заявка принята! Ждём подтверждения от администратора.");
      if (isAuthed) {
        utils.cabinet.myApplicationForEvent.invalidate({ eventId });
        utils.cabinet.myConferenceApplications.invalidate();
      } else {
        reset();
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const section = watch("section");
  const [withReport, setWithReport] = useState(false);

  useEffect(() => {
    if (!isAuthed) return;
    if (!withReport) {
      setValue("topic", LISTENER_TOPIC);
      setValue("abstract", "");
    } else {
      setValue("topic", "");
    }
  }, [withReport, isAuthed, setValue]);

  if (isAuthed) {
    const u = session.data!.user;

    if (existing.isLoading) {
      return (
        <div className="rounded-3xl border border-border/50 bg-white h-40 animate-pulse" />
      );
    }

    if (existing.data) {
      const meta = STATUS_META[existing.data.status];
      const Icon = meta.icon;
      return (
        <div className={`rounded-3xl border ${meta.accent} p-6 md:p-8 shadow-soft`}>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft">
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <Badge variant={meta.badgeVariant} className="rounded-full">
                {meta.label}
              </Badge>
              <h3 className="mt-2 text-xl font-bold">«{eventTitle}»</h3>
              <p className="mt-1 text-sm text-foreground/80">{meta.description}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/70 p-3">
                  <div className="text-xs text-muted-foreground">Секция</div>
                  <div className="font-medium">{existing.data.section}</div>
                </div>
                <div className="rounded-xl bg-white/70 p-3">
                  <div className="text-xs text-muted-foreground">Тема</div>
                  <div className="font-medium line-clamp-2">
                    {existing.data.topic}
                  </div>
                </div>
              </div>
              {existing.data.reviewerNote && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">
                    Комментарий администратора
                  </div>
                  {existing.data.reviewerNote}
                </div>
              )}
              <Link
                href="/cabinet"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5144B0] hover:underline"
              >
                Все мои заявки в личном кабинете →
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmit(
          (data) => submit.mutate(data),
          (errs) => {
            const first = Object.values(errs).find((e) => e)?.message;
            toast.error(typeof first === "string" ? first : "Заполните поля");
          },
        )}
        className="space-y-5 rounded-3xl p-6 md:p-8 gradient-brand-soft border border-[#C565FF]/20 shadow-soft"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-brand text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-2xl font-bold">Записаться на конференцию</h3>
            <p className="text-sm text-muted-foreground mt-1">«{eventTitle}»</p>
          </div>
        </div>

        {/* Профиль участника — read-only превью */}
        <div className="rounded-2xl bg-white/70 backdrop-blur p-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-sm font-semibold">
            {(u.name ?? u.email).slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="font-medium truncate">{u.name || u.email}</div>
            <div className="text-xs text-muted-foreground truncate">
              {u.email}
            </div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-700 whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Из вашего профиля
          </span>
        </div>

        {/* Секция — единственное обязательное поле */}
        <div>
          <Label>Секция</Label>
          <Select value={section} onValueChange={(v) => setValue("section", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите секцию" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.section && (
            <p className="text-xs text-destructive mt-1">
              {errors.section.message}
            </p>
          )}
        </div>

        {/* Тумблер: слушатель / с докладом */}
        <div className="rounded-2xl border border-[#C565FF]/20 bg-white/60 p-1.5 flex gap-1">
          <button
            type="button"
            onClick={() => setWithReport(false)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              !withReport
                ? "bg-white shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Только участвовать
          </button>
          <button
            type="button"
            onClick={() => setWithReport(true)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              withReport
                ? "bg-white shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic2 className="h-4 w-4" />
            Я с докладом
          </button>
        </div>

        {withReport && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <Label>Тема доклада</Label>
              <Input
                {...register("topic")}
                placeholder="Например, «Машинное обучение в задачах NLP»"
              />
              {errors.topic && (
                <p className="text-xs text-destructive mt-1">
                  {errors.topic.message}
                </p>
              )}
            </div>
            <div>
              <Label>Аннотация</Label>
              <Textarea
                rows={4}
                {...register("abstract")}
                placeholder="Краткое описание доклада"
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={submit.isPending}
          size="lg"
          className="w-full sm:w-auto rounded-full px-7 shadow-glow"
        >
          {submit.isPending ? "Отправляем..." : "Записаться"}
        </Button>

        <p className="text-xs text-muted-foreground">
          После записи администратор подтвердит вашу заявку. Статус будет виден
          в личном кабинете.
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        (data) => submit.mutate(data),
        (errs) => {
          const first = Object.values(errs).find((e) => e)?.message;
          toast.error(typeof first === "string" ? first : "Заполните поля");
        },
      )}
      className="space-y-4 rounded-3xl p-6 md:p-8 gradient-brand-soft border border-[#C565FF]/20 shadow-soft"
    >
      <div>
        <h3 className="text-2xl font-bold">Подать заявку на конференцию</h3>
        <p className="text-sm text-muted-foreground mt-1">«{eventTitle}»</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Имя" error={errors.firstName?.message}>
          <Input {...register("firstName")} />
        </Field>
        <Field label="Фамилия" error={errors.lastName?.message}>
          <Input {...register("lastName")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
        <Field label="Телефон (опционально)" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </Field>
      </div>
      <Field label="Секция" error={errors.section?.message}>
        <Select value={section} onValueChange={(v) => setValue("section", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите секцию" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Тема доклада" error={errors.topic?.message}>
        <Input {...register("topic")} />
      </Field>
      <Field label="Аннотация (опционально)" error={errors.abstract?.message}>
        <Textarea rows={5} {...register("abstract")} />
      </Field>
      <Button
        type="submit"
        disabled={submit.isPending}
        size="lg"
        className="rounded-full px-7 shadow-glow"
      >
        {submit.isPending ? "Отправляем..." : "Отправить заявку"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
