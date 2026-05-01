"use client";

import { motion } from "framer-motion";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export function PhotoMarquee({
  photos,
  speed = 60,
  reverse = false,
}: {
  photos: Photo[];
  speed?: number; 
  reverse?: boolean;
}) {
  if (photos.length === 0) return null;
  const items = [...photos, ...photos];
  return (
    <div className="relative overflow-hidden mask-fade py-4">
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="relative h-48 w-72 rounded-2xl overflow-hidden flex-shrink-0 shadow-soft group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption ?? ""}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {p.caption && (
              <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">{p.caption}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
