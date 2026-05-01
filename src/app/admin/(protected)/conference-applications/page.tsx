"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";

const statusBadge: Record<Status, { label: string; variant: "warning" | "success" | "destructive" }> = {
  pending: { label: "Ожидает", variant: "warning" },
  approved: { label: "Одобрена", variant: "success" },
  rejected: { label: "Отклонена", variant: "destructive" },
};

export default function ConferenceApplicationsPage() {
  const [tab, setTab] = useState<Status>("pending");
  const list = api.applications.listConference.useQuery({ status: tab });
  const utils = api.useUtils();
  const update = api.applications.updateConferenceStatus.useMutation({
    onSuccess: () => {
      toast.success("Статус обновлён, письмо отправлено");
      utils.applications.listConference.invalidate();
      utils.reports.summary.invalidate();
      setReviewing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const [reviewing, setReviewing] = useState<{
    id: string;
    decision: "approved" | "rejected";
    name: string;
  } | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Заявки на конференции</h1>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
        <TabsList>
          <TabsTrigger value="pending">Ожидают</TabsTrigger>
          <TabsTrigger value="approved">Одобренные</TabsTrigger>
          <TabsTrigger value="rejected">Отклонённые</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Конференция</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Секция / тема</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : (list.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Заявок нет.
                    </TableCell>
                  </TableRow>
                ) : (
                  (list.data ?? []).map(({ app, event }) => (
                    <TableRow key={app.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(app.createdAt)}
                      </TableCell>
                      <TableCell>{event?.title ?? "-"}</TableCell>
                      <TableCell>
                        {app.lastName} {app.firstName}
                      </TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium">{app.section}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {app.topic}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge[app.status].variant}>
                          {statusBadge[app.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setReviewing({
                                  id: app.id,
                                  decision: "approved",
                                  name: `${app.firstName} ${app.lastName}`,
                                });
                                setNote("");
                              }}
                            >
                              Одобрить
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setReviewing({
                                  id: app.id,
                                  decision: "rejected",
                                  name: `${app.firstName} ${app.lastName}`,
                                });
                                setNote("");
                              }}
                            >
                              Отклонить
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {app.reviewedAt ? formatDateTime(app.reviewedAt) : ""}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewing?.decision === "approved" ? "Одобрить" : "Отклонить"} заявку
            </DialogTitle>
            <DialogDescription>
              {reviewing?.name}. Заявитель получит email с решением.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Комментарий (опционально)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>
              Отмена
            </Button>
            <Button
              variant={reviewing?.decision === "approved" ? "default" : "destructive"}
              disabled={update.isPending}
              onClick={() =>
                reviewing &&
                update.mutate({
                  id: reviewing.id,
                  status: reviewing.decision,
                  reviewerNote: note,
                })
              }
            >
              {update.isPending ? "..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
