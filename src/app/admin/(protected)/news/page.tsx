"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { newsInputSchema, type NewsInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export default function AdminNewsPage() {
  const list = api.news.adminList.useQuery();
  const utils = api.useUtils();
  const [editing, setEditing] = useState<{ id?: string } | null>(null);

  const create = api.news.create.useMutation({
    onSuccess: () => {
      toast.success("Новость создана");
      utils.news.adminList.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const update = api.news.update.useMutation({
    onSuccess: () => {
      toast.success("Сохранено");
      utils.news.adminList.invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const del = api.news.delete.useMutation({
    onSuccess: () => {
      toast.success("Удалено");
      utils.news.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Новости</h1>
        <Button onClick={() => setEditing({})}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(list.data ?? []).map((n) => (
              <TableRow key={n.id}>
                <TableCell>{formatDate(n.publishedAt)}</TableCell>
                <TableCell>{n.title}</TableCell>
                <TableCell>
                  {n.isPublished ? (
                    <Badge variant="success">Опубликовано</Badge>
                  ) : (
                    <Badge variant="outline">Черновик</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ id: n.id })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Удалить «${n.title}»?`)) del.mutate(n.id);
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
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Новостей нет.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <NewsDialog
          open
          onClose={() => setEditing(null)}
          newsId={editing.id}
          onCreate={(data) => create.mutate(data)}
          onUpdate={(id, data) => update.mutate({ id, ...data })}
          submitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}

function NewsDialog({
  open,
  onClose,
  newsId,
  onCreate,
  onUpdate,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  newsId?: string;
  onCreate: (data: NewsInput) => void;
  onUpdate: (id: string, data: NewsInput) => void;
  submitting: boolean;
}) {
  const existing = api.news.adminById.useQuery(newsId!, { enabled: !!newsId });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NewsInput>({
    resolver: zodResolver(newsInputSchema),
    defaultValues: {
      title: "",
      content: "",
      coverUrl: "",
      isPublished: true,
    },
  });

  if (existing.data && watch("title") === "") {
    reset({
      title: existing.data.title,
      content: existing.data.content,
      coverUrl: existing.data.coverUrl ?? "",
      isPublished: existing.data.isPublished,
    });
  }

  const coverUrl = watch("coverUrl");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{newsId ? "Редактировать" : "Создать"} новость</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            (data) => {
              if (newsId) onUpdate(newsId, data);
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
            <Label>Заголовок</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Текст</Label>
            <Textarea rows={8} {...register("content")} />
          </div>
          <ImageUploader
            label="Обложка"
            value={(coverUrl as string | null) || null}
            onChange={(url) => setValue("coverUrl", url ?? "")}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublishedNews"
              checked={watch("isPublished")}
              onChange={(e) => setValue("isPublished", e.target.checked)}
            />
            <Label htmlFor="isPublishedNews">Опубликовано</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
