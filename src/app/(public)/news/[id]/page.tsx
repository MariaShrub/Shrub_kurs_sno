import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { Button } from "@/components/ui/button";
import { BlobBackground } from "@/components/ui/blob-background";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function NewsItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await api.news.byId(id);
  if (!item) notFound();
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] -z-10 overflow-hidden">
        <div className="absolute inset-0 gradient-brand-soft" />
        <BlobBackground variant="soft" />
      </div>
      <div className="container py-8 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" /> Все новости
          </Link>
        </Button>
        {item.coverUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.coverUrl}
            alt={item.title}
            className="mt-6 w-full max-h-96 object-cover rounded-3xl shadow-soft"
          />
        )}
        <div className="mt-6 text-sm text-muted-foreground">
          {formatDate(item.publishedAt)}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
          {item.title}
        </h1>
        <div className="rounded-3xl border border-border/50 bg-white p-6 md:p-8 shadow-soft">
          <p className="whitespace-pre-line leading-relaxed text-foreground/90">
            {item.content}
          </p>
        </div>
      </div>
    </div>
  );
}
