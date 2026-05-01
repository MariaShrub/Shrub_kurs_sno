import { type ReactNode } from "react";
import { BlobBackground } from "./blob-background";
import { cn } from "@/lib/utils";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({ title, subtitle, badge, actions, className }: Props) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <BlobBackground variant="soft" />
      <div className="bg-gradient-to-b from-white/0 via-white/40 to-white relative">
        <div className="container relative py-16 md:py-20">
          {badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C565FF]/30 bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-[#5144B0] mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C565FF] animate-pulse" />
              {badge}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          )}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
