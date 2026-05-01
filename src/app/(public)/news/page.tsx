import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { PageHero } from "@/components/ui/page-hero";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Новости" };

export default async function NewsListPage() {
  const news = await api.news.list();
  return (
    <div>
      <PageHero
        badge="Журнал"
        title={
          <>
            Новости <span className="text-gradient">сообщества</span>
          </>
        }
        subtitle="Что происходит в СНО ОмГУПС: победы, мероприятия, объявления и важные обновления."
      />
      <div className="container py-12">
        {news.length === 0 ? (
          <ScrollReveal>
            <p className="text-muted-foreground text-center">Новостей пока нет.</p>
          </ScrollReveal>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => (
              <StaggerItem key={n.id}>
                <Link href={`/news/${n.id}`} className="block group h-full">
                  <article className="h-full rounded-3xl overflow-hidden border border-border/50 bg-white shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
                    {n.coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={n.coverUrl}
                        alt={n.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 gradient-brand-soft flex items-center justify-center">
                        <Newspaper className="h-12 w-12 text-[#8A4DFF]/60" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(n.publishedAt)}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold group-hover:text-[#5144B0] transition-colors line-clamp-2">
                        {n.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {n.content}
                      </p>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
