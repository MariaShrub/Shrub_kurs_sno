import { cn } from "@/lib/utils";

interface BlobBackgroundProps {
  className?: string;
  variant?: "hero" | "soft" | "dense";
}

export function BlobBackground({ className, variant = "hero" }: BlobBackgroundProps) {
  const opacity = variant === "soft" ? "opacity-50" : variant === "dense" ? "opacity-90" : "opacity-70";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-[#5144B0] blur-3xl animate-blob",
          opacity,
        )}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={cn(
          "absolute top-1/3 -right-24 h-[460px] w-[460px] rounded-full bg-[#C565FF] blur-3xl animate-blob",
          opacity,
        )}
        style={{ animationDelay: "-6s" }}
      />
      <div
        className={cn(
          "absolute -bottom-40 left-1/4 h-[520px] w-[520px] rounded-full bg-[#FBBBFF] blur-3xl animate-blob",
          opacity,
        )}
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
