"use client";

import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const activity = api.reports.activity.useQuery();
  const summary = api.reports.summary.useQuery();

  function exportCsv() {
    if (!activity.data) return;
    const rows = [
      ["Фамилия", "Имя", "Институт", "Курс", "Конференций (одобрено)"],
      ...activity.data.map((r) => [
        r.last_name,
        r.first_name,
        r.institute,
        String(r.course),
        String(r.conferences),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sno-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Отчёт по активности</h1>
        <Button onClick={exportCsv} disabled={!activity.data?.length}>
          <Download className="h-4 w-4" /> Экспорт CSV
        </Button>
      </div>
      {summary.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Участников" value={summary.data.membersCount} />
          <Stat label="Заявок на вступление (ожидают)" value={summary.data.pendingJoin} />
          <Stat label="Заявок на конференции (ожидают)" value={summary.data.pendingConference} />
          <Stat label="Предстоящих мероприятий" value={summary.data.upcomingEvents} />
        </div>
      )}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Участник</TableHead>
              <TableHead>Институт</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead className="text-right">Одобр. заявок на конференции</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(activity.data ?? []).map((r) => (
              <TableRow key={r.member_id}>
                <TableCell>
                  {r.last_name} {r.first_name}
                </TableCell>
                <TableCell>{r.institute}</TableCell>
                <TableCell>{r.course}</TableCell>
                <TableCell className="text-right font-medium">{r.conferences}</TableCell>
              </TableRow>
            ))}
            {(activity.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Данных пока нет.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-md p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
