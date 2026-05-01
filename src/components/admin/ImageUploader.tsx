"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Изображение" }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(e.error ?? "Не удалось загрузить");
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      toast.success("Файл загружен");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="h-32 w-32 object-cover rounded-md border"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border-2 border-dashed px-4 py-3 text-sm hover:bg-accent">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Загрузка..." : "Загрузить файл"}
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
