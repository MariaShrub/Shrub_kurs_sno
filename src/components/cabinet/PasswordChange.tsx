"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(6, "Минимум 6 символов"),
    confirm: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function PasswordChange() {
  const change = api.cabinet.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Пароль изменён");
      reset();
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        change.mutate({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      )}
      className="rounded-3xl border border-border/50 bg-white p-6 md:p-8 shadow-soft space-y-4 max-w-lg"
    >
      <div>
        <Label>Текущий пароль</Label>
        <Input type="password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-xs text-destructive mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div>
        <Label>Новый пароль</Label>
        <Input type="password" {...register("newPassword")} />
        {errors.newPassword && (
          <p className="text-xs text-destructive mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>
      <div>
        <Label>Повторите новый пароль</Label>
        <Input type="password" {...register("confirm")} />
        {errors.confirm && (
          <p className="text-xs text-destructive mt-1">
            {errors.confirm.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full px-7 shadow-glow"
        disabled={change.isPending}
      >
        {change.isPending ? "Сохранение..." : "Сменить пароль"}
      </Button>
    </form>
  );
}
