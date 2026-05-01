import Link from "next/link";
import { CabinetTabs } from "@/components/cabinet/CabinetTabs";
import { BlobBackground } from "@/components/ui/blob-background";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Личный кабинет — СНО" };

export default function CabinetPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <BlobBackground variant="soft" />
      <div className="container py-10 md:py-14 max-w-4xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C565FF]/30 bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-medium text-[#5144B0] shadow-soft">
            <Sparkles className="h-4 w-4" />
            Личный кабинет
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            Ваш <span className="text-gradient">профиль в СНО ОмГУПС</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Редактируйте био и достижения, следите за заявками на конференции,
            меняйте пароль.{" "}
            <Link
              href="/members"
              className="text-[#5144B0] underline-offset-4 hover:underline"
            >
              Открыть мой профиль публично →
            </Link>
          </p>
        </div>
        <CabinetTabs />
      </div>
    </div>
  );
}
