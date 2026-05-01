"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface MemberCardData {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  institute: string;
  course: number;
  photoUrl: string | null;
}

const initialsGradients = [
  "from-[#5144B0] to-[#8A4DFF]",
  "from-[#8A4DFF] to-[#C565FF]",
  "from-[#C565FF] to-[#E183FF]",
  "from-[#7B4DFF] to-[#FBBBFF]",
];

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return initialsGradients[hash % initialsGradients.length];
}

export function MemberCard({ member }: { member: MemberCardData }) {
  const gradient = gradientFor(member.lastName + member.firstName);
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/members/${member.id}`} className="block group h-full">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-white shadow-soft transition-shadow duration-300 group-hover:shadow-glow h-full">
          <div className={`relative aspect-[4/5] bg-gradient-to-br ${gradient}`}>
            {member.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={member.photoUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-7xl font-bold opacity-90">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
            <div className="absolute bottom-3 left-3 right-3">
              <Badge className="rounded-full bg-white/90 text-[#5144B0] hover:bg-white">
                {member.position}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <div className="font-semibold text-lg leading-tight group-hover:text-[#5144B0] transition-colors">
              {member.lastName} {member.firstName}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {member.institute}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {member.course} курс
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
