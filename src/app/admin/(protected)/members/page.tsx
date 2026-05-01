"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { memberInputSchema, type MemberInput } from "@/lib/validators";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminMembersPage() {
  const list = api.members.list.useQuery();
  const utils = api.useUtils();
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  const create = api.members.create.useMutation({
    onSuccess: () => {
      toast.success("Участник создан");
      utils.members.list.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const update = api.members.update.useMutation({
    onSuccess: () => {
      toast.success("Сохранено");
      utils.members.list.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const del = api.members.delete.useMutation({
    onSuccess: () => {
      toast.success("Удалено");
      utils.members.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Участники СНО</h1>
        <Button onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Фото</TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Институт</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(list.data ?? []).map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  {m.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.photoUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">
                      {m.firstName[0]}
                      {m.lastName[0]}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {m.lastName} {m.firstName}
                </TableCell>
                <TableCell>{m.position}</TableCell>
                <TableCell>{m.institute}</TableCell>
                <TableCell>{m.course}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing({ id: m.id })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Удалить ${m.firstName} ${m.lastName}?`)) {
                          del.mutate(m.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(list.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Ещё нет участников.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <MemberDialog
          open
          onClose={() => setEditing(null)}
          memberId={editing.id}
          onCreate={(data) => create.mutate(data)}
          onUpdate={(id, data) => update.mutate({ id, ...data })}
          submitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}

function MemberDialog({
  open,
  onClose,
  memberId,
  onCreate,
  onUpdate,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  memberId?: string;
  onCreate: (data: MemberInput) => void;
  onUpdate: (id: string, data: MemberInput) => void;
  submitting: boolean;
}) {
  const existing = api.members.byId.useQuery(memberId!, {
    enabled: !!memberId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MemberInput>({
    resolver: zodResolver(memberInputSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      position: "Член СНО",
      institute: "",
      course: 1,
      bio: "",
      achievements: "",
      photoUrl: "",
      socialLinks: { telegram: "", vk: "", email: "" },
    },
  });

  if (existing.data && watch("firstName") === "") {
    reset({
      firstName: existing.data.firstName,
      lastName: existing.data.lastName,
      position: existing.data.position,
      institute: existing.data.institute,
      course: existing.data.course,
      bio: existing.data.bio ?? "",
      achievements: existing.data.achievements ?? "",
      photoUrl: existing.data.photoUrl ?? "",
      socialLinks: existing.data.socialLinks ?? { telegram: "", vk: "", email: "" },
    });
  }

  const photoUrl = watch("photoUrl");
  const course = watch("course");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {memberId ? "Редактировать участника" : "Новый участник"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            (data) => {
              if (memberId) onUpdate(memberId, data);
              else onCreate(data);
            },
            (errors) => {
              const first = Object.values(errors).find((e) => e)?.message;
              toast.error(
                typeof first === "string"
                  ? first
                  : "Проверьте поля формы — есть ошибки",
              );
            },
          )}
          className="space-y-3"
        >
          <ImageUploader
            label="Фото участника"
            value={(photoUrl as string | null) || null}
            onChange={(url) => setValue("photoUrl", url ?? "")}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Имя</Label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label>Фамилия</Label>
              <Input {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label>Должность</Label>
              <Input {...register("position")} />
            </div>
            <div>
              <Label>Институт</Label>
              <Input {...register("institute")} />
            </div>
            <div>
              <Label>Курс</Label>
              <Select
                value={String(course)}
                onValueChange={(v) => setValue("course", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      {c} курс
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Биография</Label>
            <Textarea rows={3} {...register("bio")} />
          </div>
          <div>
            <Label>Достижения</Label>
            <Textarea rows={3} {...register("achievements")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Telegram</Label>
              <Input {...register("socialLinks.telegram")} placeholder="@username" />
              {errors.socialLinks?.telegram && (
                <p className="text-xs text-destructive mt-1">
                  {errors.socialLinks.telegram.message}
                </p>
              )}
            </div>
            <div>
              <Label>VK</Label>
              <Input {...register("socialLinks.vk")} placeholder="username" />
              {errors.socialLinks?.vk && (
                <p className="text-xs text-destructive mt-1">
                  {errors.socialLinks.vk.message}
                </p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register("socialLinks.email")} placeholder="name@example.com" />
              {errors.socialLinks?.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.socialLinks.email.message ?? "Неверный email"}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
