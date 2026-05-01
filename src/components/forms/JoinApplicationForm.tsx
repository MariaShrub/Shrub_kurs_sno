"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import {
  joinApplicationSchema,
  type JoinApplicationInput,
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

export function JoinApplicationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<JoinApplicationInput>({
    resolver: zodResolver(joinApplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      institute: "",
      course: 1,
      motivation: "",
    },
  });

  const submit = api.applications.submitJoin.useMutation({
    onSuccess: () => {
      toast.success("Заявка принята! Мы свяжемся с вами по email.");
      reset();
    },
    onError: (e) => toast.error(e.message),
  });

  const course = watch("course");

  return (
    <form
      onSubmit={handleSubmit((data) => submit.mutate(data))}
      className="space-y-4"
    >
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
        <Field label="Институт" error={errors.institute?.message}>
          <Input {...register("institute")} />
        </Field>
        <Field label="Курс" error={errors.course?.message}>
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
        </Field>
      </div>
      <Field
        label="Расскажите о себе и почему хотите вступить в СНО"
        error={errors.motivation?.message}
      >
        <Textarea rows={6} {...register("motivation")} />
      </Field>
      <Button
        type="submit"
        disabled={submit.isPending}
        size="lg"
        className="rounded-full px-7 shadow-glow group"
      >
        {submit.isPending ? "Отправляем..." : (
          <>
            Отправить заявку
            <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </>
        )}
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
