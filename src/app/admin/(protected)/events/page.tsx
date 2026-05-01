"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { eventInputSchema, type EventInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";

export default function AdminEventsPage() {
  const list = api.events.adminList.useQuery();
  const utils = api.useUtils();
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  const create = api.events.create.useMutation({
    onSuccess: () => {
      toast.success("Мероприятие создано");
      utils.events.adminList.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const update = api.events.update.useMutation({
    onSuccess: () => {
      toast.success("Сохранено");
      utils.events.adminList.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const del = api.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Удалено");
      utils.events.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Мероприятия</h1>
        <Button onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(list.data ?? []).map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(e.startDate)}
                </TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell>
                  <Badge variant={e.type === "conference" ? "default" : "secondary"}>
                    {e.type === "conference" ? "Конференция" : "Мероприятие"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {e.isPublished ? (
                    <Badge variant="success">Опубликовано</Badge>
                  ) : (
                    <Badge variant="outline">Черновик</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ id: e.id })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Удалить «${e.title}»?`)) del.mutate(e.id);
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
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Мероприятий нет.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <EventDialog
          open
          onClose={() => setEditing(null)}
          eventId={editing.id}
          onCreate={(data) => create.mutate(data)}
          onUpdate={(id, data) => update.mutate({ id, ...data })}
          submitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}

function EventDialog({
  open,
  onClose,
  eventId,
  onCreate,
  onUpdate,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  eventId?: string;
  onCreate: (data: EventInput) => void;
  onUpdate: (id: string, data: EventInput) => void;
  submitting: boolean;
}) {
  const existing = api.events.byId.useQuery(eventId!, { enabled: !!eventId });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EventInput>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "event",
      startDate: new Date(),
      endDate: null,
      location: "",
      coverUrl: "",
      sections: [],
      isPublished: true,
    },
  });

  if (existing.data && watch("title") === "") {
    reset({
      title: existing.data.title,
      description: existing.data.description,
      type: existing.data.type,
      startDate: new Date(existing.data.startDate),
      endDate: existing.data.endDate ? new Date(existing.data.endDate) : null,
      location: existing.data.location ?? "",
      coverUrl: existing.data.coverUrl ?? "",
      sections: existing.data.sections,
      isPublished: existing.data.isPublished,
    });
  }

  const type = watch("type");
  const sections = watch("sections");
  const coverUrl = watch("coverUrl");
  const [newSection, setNewSection] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{eventId ? "Редактировать" : "Создать"} мероприятие</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            (data) => {
              if (eventId) onUpdate(eventId, data);
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
          <div>
            <Label>Тип</Label>
            <Select value={type} onValueChange={(v) => setValue("type", v as "event" | "conference")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Мероприятие</SelectItem>
                <SelectItem value="conference">Конференция</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Название</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea rows={4} {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Дата начала</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(watch("startDate"))}
                onChange={(e) => setValue("startDate", new Date(e.target.value))}
              />
            </div>
            <div>
              <Label>Дата окончания (опц.)</Label>
              <Input
                type="datetime-local"
                value={watch("endDate") ? toLocalInput(watch("endDate")!) : ""}
                onChange={(e) =>
                  setValue("endDate", e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
          </div>
          <div>
            <Label>Место проведения</Label>
            <Input {...register("location")} />
          </div>
          <ImageUploader
            label="Обложка"
            value={(coverUrl as string | null) || null}
            onChange={(url) => setValue("coverUrl", url ?? "")}
          />
          {type === "conference" && (
            <div>
              <Label>Секции</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {sections.map((s, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {s}
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "sections",
                            sections.filter((_, idx) => idx !== i),
                          )
                        }
                        className="ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="Название секции"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newSection.trim()) {
                        setValue("sections", [...sections, newSection.trim()]);
                        setNewSection("");
                      }
                    }}
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={watch("isPublished")}
              onChange={(e) => setValue("isPublished", e.target.checked)}
            />
            <Label htmlFor="isPublished">Опубликовано</Label>
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

function toLocalInput(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const tz = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tz).toISOString().slice(0, 16);
}
