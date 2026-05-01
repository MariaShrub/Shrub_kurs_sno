import { JoinApplicationForm } from "@/components/forms/JoinApplicationForm";
import { FormGate } from "@/components/forms/SignedInNotice";
import { BlobBackground } from "@/components/ui/blob-background";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Подать заявку на вступление в СНО ОмГУПС" };

export default function ApplyPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <BlobBackground variant="soft" />
      <div className="container py-12 md:py-20 max-w-3xl">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C565FF]/30 bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-medium text-[#5144B0] mb-4 shadow-soft">
            <Sparkles className="h-4 w-4" />
            Вступление
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Стань частью <span className="text-gradient">научного сообщества</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Заполните форму ниже. Мы рассмотрим заявку в течение нескольких дней
            и пришлём ответ на email.
          </p>
        </div>
        <div className="mt-10">
          <FormGate
            mode="guest"
            notice="Заявка на вступление — только для гостей. Вы уже в системе — открывайте свой кабинет."
          >
            <div className="rounded-3xl border border-border/50 bg-white p-6 md:p-10 shadow-glow">
              <JoinApplicationForm />
            </div>
          </FormGate>
        </div>
      </div>
    </div>
  );
}
