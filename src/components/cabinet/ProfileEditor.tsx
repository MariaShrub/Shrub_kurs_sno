"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface FormValues {
  bio: string;
  achievements: string;
  photoUrl: string;
  socialLinks: { telegram: string; vk: string; email: string };
}

export function ProfileEditor() {
  const profile = api.cabinet.myProfile.useQuery();
  const utils = api.useUtils();
  const update = api.cabinet.updateMyProfile.useMutation({
    onSuccess: () => {
      toast.success("Профиль сохранён");
      utils.cabinet.myProfile.invalidate();
      utils.members.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      bio: "",
      achievements: "",
      photoUrl: "",
      socialLinks: { telegram: "", vk: "", email: "" },
    },
  });

  useEffect(() => {
    if (profile.data) {
      reset({
        bio: profile.data.bio ?? "",
        achievements: profile.data.achievements ?? "",
        photoUrl: profile.data.photoUrl ?? "",
        socialLinks: {
          telegram: profile.data.socialLinks?.telegram ?? "",
          vk: profile.data.socialLinks?.vk ?? "",
          email: profile.data.socialLinks?.email ?? "",
        },
      });
    }
  }, [profile.data, reset]);

  if (profile.isLoading) {
    return <div className="text-muted-foreground">Загрузка профиля...</div>;
  }
  if (!profile.data) {
    return (
      <div className="rounded-3xl border border-[#C565FF]/30 bg-white p-6 md:p-8 shadow-soft space-y-3">
        <h3 className="text-lg font-semibold">Карточка участника не найдена</h3>
        <p className="text-sm text-muted-foreground">
          Ваш аккаунт зарегистрирован, но к нему пока не привязана публичная
          карточка участника СНО. Обычно это случается, если аккаунт создан
          напрямую, а не через одобрение заявки на вступление.
        </p>
        <p className="text-sm text-muted-foreground">
          Чтобы это исправить, попросите администратора привязать вашу
          карточку из раздела «Участники» или подайте заявку на вступление
          заново — после одобрения профиль появится автоматически.
        </p>
      </div>
    );
  }

  const photoUrl = watch("photoUrl");

  return (
    <form
      onSubmit={handleSubmit((data) =>
        update.mutate({
          bio: data.bio,
          achievements: data.achievements,
          photoUrl: data.photoUrl,
          socialLinks: data.socialLinks,
        }),
      )}
      className="space-y-5 rounded-3xl border border-border/50 bg-white p-6 md:p-8 shadow-soft"
    >
      {/* Read-only часть от админа */}
      <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-border/50">
        <div>
          <div className="text-xs text-muted-foreground">ФИО</div>
          <div className="font-semibold">
            {profile.data.lastName} {profile.data.firstName}
          </div>
        </div>
        <Badge className="rounded-full">{profile.data.position}</Badge>
        <span className="text-sm text-muted-foreground">
          {profile.data.institute} · {profile.data.course} курс
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          ФИО, должность, институт и курс редактирует администратор
        </span>
      </div>

      <ImageUploader
        label="Фото профиля"
        value={(photoUrl as string | null) || null}
        onChange={(url) => setValue("photoUrl", url ?? "")}
      />

      <div>
        <Label>О себе</Label>
        <Textarea rows={4} {...register("bio")} placeholder="Расскажите о научных интересах" />
      </div>
      <div>
        <Label>Достижения</Label>
        <Textarea rows={4} {...register("achievements")} placeholder="Награды, публикации, гранты" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Telegram</Label>
          <Input {...register("socialLinks.telegram")} placeholder="@username" />
        </div>
        <div>
          <Label>VK</Label>
          <Input {...register("socialLinks.vk")} placeholder="username" />
        </div>
        <div>
          <Label>Контактный email</Label>
          <Input {...register("socialLinks.email")} placeholder="name@example.com" />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="rounded-full px-7 shadow-glow"
        disabled={update.isPending}
      >
        {update.isPending ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}
