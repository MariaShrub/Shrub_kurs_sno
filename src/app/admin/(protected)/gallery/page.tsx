"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminGalleryPage() {
  const list = api.gallery.list.useQuery();
  const utils = api.useUtils();
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const create = api.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Фото добавлено");
      utils.gallery.list.invalidate();
      setAdding(false);
      setUrl(null);
      setCaption("");
    },
    onError: (e) => toast.error(e.message),
  });
  const del = api.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Удалено");
      utils.gallery.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Фотогалерея</h1>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Добавить фото
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(list.data ?? []).map((p) => (
          <div key={p.id} className="relative group rounded-md overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? ""} className="w-full aspect-square object-cover" />
            {p.caption && (
              <div className="p-2 text-xs text-muted-foreground line-clamp-2">{p.caption}</div>
            )}
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                if (confirm("Удалить фото?")) del.mutate(p.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {(list.data ?? []).length === 0 && (
          <p className="text-muted-foreground col-span-full">Фотографий пока нет.</p>
        )}
      </div>

      <Dialog open={adding} onOpenChange={(o) => !o && setAdding(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новое фото</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <ImageUploader value={url} onChange={setUrl} label="Файл" />
            <div>
              <Label>Подпись (опционально)</Label>
              <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Отмена
            </Button>
            <Button
              disabled={create.isPending}
              onClick={() => {
                if (!url) {
                  toast.error("Сначала загрузите файл");
                  return;
                }
                create.mutate({ url, caption });
              }}
            >
              {create.isPending ? "..." : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
