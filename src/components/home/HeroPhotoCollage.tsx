"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Sparkles, Atom, FlaskConical } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

interface Props {
  photos: Photo[];
}

export function HeroPhotoCollage({ photos }: Props) {
  const pool = photos.length >= 3 ? photos.slice(0, 3) : photos;
  while (pool.length < 3) pool.push(pool[pool.length - 1] ?? { id: "x", url: "", caption: null });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 50, damping: 20 });
  const y = useSpring(my, { stiffness: 50, damping: 20 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mx.set(((e.clientX - w / 2) / w) * 30); 
      my.set(((e.clientY - h / 2) / h) * 30);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const x1 = useTransform(x, (v) => v * -1);
  const y1 = useTransform(y, (v) => v * -1);
  const x2 = useTransform(x, (v) => v * 1.2);
  const y2 = useTransform(y, (v) => v * 1.2);
  const x3 = useTransform(x, (v) => v * 0.5);
  const y3 = useTransform(y, (v) => v * -0.7);

  const cards = [
    {
      photo: pool[0],
      style: {
        rotate: -7,
        top: "0%",
        left: "8%",
        x: x1,
        y: y1,
        zIndex: 3,
      },
      tag: { icon: Atom, label: "Наука" },
      delay: 0,
    },
    {
      photo: pool[1],
      style: {
        rotate: 6,
        top: "30%",
        left: "45%",
        x: x2,
        y: y2,
        zIndex: 2,
      },
      tag: { icon: Sparkles, label: "Конференции" },
      delay: 0.15,
    },
    {
      photo: pool[2],
      style: {
        rotate: -3,
        top: "60%",
        left: "10%",
        x: x3,
        y: y3,
        zIndex: 1,
      },
      tag: { icon: FlaskConical, label: "Исследования" },
      delay: 0.3,
    },
  ] as const;

  return (
    <div className="relative h-[460px] md:h-[520px] hidden lg:block">
      {cards.map((c, i) => {
        const TagIcon = c.tag.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, rotate: c.style.rotate * 2 }}
            animate={{ opacity: 1, y: 0, rotate: c.style.rotate }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
              delay: c.delay,
            }}
            style={{
              position: "absolute",
              top: c.style.top,
              left: c.style.left,
              x: c.style.x,
              y: c.style.y,
              zIndex: c.style.zIndex,
              transformOrigin: "center",
            }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className="w-56 group cursor-pointer"
          >
            <div className="rounded-3xl overflow-hidden bg-white p-2 shadow-glow">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted relative">
                {c.photo.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.photo.url}
                    alt={c.photo.caption ?? ""}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full gradient-brand" />
                )}
              </div>
              <div className="p-2 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
                  <TagIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                  {c.tag.label}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
      {/* Декоративные «искры» */}
      <motion.div
        aria-hidden
        className="absolute top-10 right-10 h-3 w-3 rounded-full bg-[#C565FF]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-10 right-32 h-2 w-2 rounded-full bg-[#8A4DFF]"
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.6, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-0 h-2 w-2 rounded-full bg-[#FBBBFF]"
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
}
