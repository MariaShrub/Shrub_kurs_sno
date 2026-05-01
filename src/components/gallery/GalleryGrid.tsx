"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  return (
    <>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {photos.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => setActive(p)}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
            }}
            whileHover={{ y: -4 }}
            className={`relative group overflow-hidden rounded-3xl bg-muted shadow-soft hover:shadow-glow transition-shadow ${
              i % 7 === 0
                ? "aspect-[4/5] md:row-span-2"
                : i % 5 === 0
                  ? "aspect-[5/4]"
                  : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? "Фото"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {p.caption && (
              <div className="absolute bottom-3 left-3 right-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {p.caption}
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0">
          <DialogTitle className="sr-only">
            {active?.caption ?? "Фото"}
          </DialogTitle>
          {active && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.caption ?? "Фото"}
                className="w-full max-h-[85vh] object-contain"
              />
              {active.caption && (
                <p className="text-center text-sm text-white/80 p-4">
                  {active.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
