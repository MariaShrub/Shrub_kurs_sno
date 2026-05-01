import { api } from "@/lib/trpc/server";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PageHero } from "@/components/ui/page-hero";

export const metadata = { title: "Фотогалерея" };

export default async function GalleryPage() {
  const photos = await api.gallery.list();
  return (
    <div>
      <PageHero
        badge="Архив"
        title={
          <>
            Фото<span className="text-gradient">галерея</span>
          </>
        }
        subtitle="Моменты жизни СНО: заседания, конференции, лаборатории и поездки."
      />
      <div className="container py-12">
        {photos.length === 0 ? (
          <p className="text-muted-foreground text-center">Фотографий пока нет.</p>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </div>
    </div>
  );
}
