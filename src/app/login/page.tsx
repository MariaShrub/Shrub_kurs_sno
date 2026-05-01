"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlobBackground } from "@/components/ui/blob-background";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

function destinationByRole(role: string | null | undefined) {
  return role === "admin" ? "/admin" : "/cabinet";
}

export default function LoginPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session.data?.user) {
      router.replace(destinationByRole(session.data.user.role));
    }
  }, [session.data, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        toast.error(res.error.message ?? "Не удалось войти");
        return;
      }
      const role = res.data?.user?.role as string | undefined;
      router.push(destinationByRole(role));
      router.refresh();
    } catch {
      toast.error("Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center p-4">
      <BlobBackground />
      <div className="absolute inset-0 bg-grid opacity-30 -z-10" />
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-semibold text-xl mb-6 group"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-brand text-white shadow-glow group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-gradient">СНО ОмГУПС</span>
        </Link>
        <div className="rounded-3xl border border-border/50 glass-strong p-8 shadow-glow">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Вход</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Для участников и администраторов
            </p>
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full shadow-glow"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground">
            Хотите вступить в СНО ОмГУПС?{" "}
            <Link href="/apply" className="text-[#8A4DFF] hover:underline">
              Подать заявку
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
