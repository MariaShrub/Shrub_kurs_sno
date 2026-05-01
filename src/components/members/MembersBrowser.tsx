"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMemberFilters } from "@/stores/members-filters";
import { MemberCard } from "./MemberCard";

export function MembersBrowser() {
  const { institute, course, search, setInstitute, setCourse, setSearch, reset } =
    useMemberFilters();

  const institutesQuery = api.members.institutes.useQuery();
  const membersQuery = api.members.list.useQuery({
    institute: institute ?? undefined,
    course: course ?? undefined,
    search: search || undefined,
  });

  const filtersActive = !!(institute || course || search);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/50 bg-white shadow-soft p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или должности"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-border/50"
            />
          </div>
          <Select
            value={institute ?? "all"}
            onValueChange={(v) => setInstitute(v === "all" ? null : v)}
          >
            <SelectTrigger className="rounded-full border-border/50">
              <SelectValue placeholder="Институт" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все институты</SelectItem>
              {(institutesQuery.data ?? []).map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={course ? String(course) : "all"}
            onValueChange={(v) => setCourse(v === "all" ? null : Number(v))}
          >
            <SelectTrigger className="rounded-full border-border/50">
              <SelectValue placeholder="Курс" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все курсы</SelectItem>
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <SelectItem key={c} value={String(c)}>
                  {c} курс
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={reset}
            disabled={!filtersActive}
            className="rounded-full"
          >
            Сбросить
          </Button>
        </div>
      </div>

      {membersQuery.isLoading ? (
        <div className="text-muted-foreground">Загрузка...</div>
      ) : (membersQuery.data ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Никого не нашли по фильтрам.
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {(membersQuery.data ?? []).map((m, i) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
              >
                <MemberCard member={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
