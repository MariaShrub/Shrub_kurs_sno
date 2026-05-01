"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export function GalleryShowcase({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;
  const items = photos.slice(0, 7);

  const cells = [
    "col-span-2 row-span-2", // big
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-2", // tall
    "col-span-1 row-span-1",
    "col-span-2 row-span-1", // wide
    "col-span-1 row-span-1",
  ];

  return (
    <div className="space-y-6">
      <motion.div
        layout
        className="grid grid-cols-4 grid-rows-3 gap-3 md:gap-4 h-[420px] md:h-[560px]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        }}
      >
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            variants={{
              hidden: { opacity: 0, scale: 0.85, y: 30 },
              show: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ scale: 1.03, zIndex: 5 }}
            className={`relative rounded-2xl md:rounded-3xl overflow-hidden shadow-soft group ${cells[i] ?? ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? ""}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {p.caption && (
              <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                {p.caption}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className="flex justify-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-6 py-3 text-sm font-medium hover:shadow-soft transition-shadow group"
        >
          Смотреть всю галерею
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
