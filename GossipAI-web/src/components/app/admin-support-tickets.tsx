"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiMutation, useApiQuery } from "@/lib/query/hooks";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast/notify";

const supportTicketStatusSchema = z.enum(["open", "in_progress", "resolved"]);

const supportTicketSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  category: z.string(),
  subject: z.string(),
  message: z.string(),
  status: supportTicketStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    plan: z.enum(["basic", "premium"]),
  }).nullable(),
});

const supportTicketsSchema = z.array(supportTicketSchema);

const updateStatusResponseSchema = z.object({
  id: z.string(),
  status: supportTicketStatusSchema,
  updatedAt: z.string(),
});

type SupportTicket = z.infer<typeof supportTicketSchema>;
type SupportTicketStatus = z.infer<typeof supportTicketStatusSchema>;

const statusLabels: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

const statusVariants: Record<SupportTicketStatus, "default" | "secondary" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
};

export function AdminSupportTickets() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const ticketsQuery = useApiQuery({
    queryKey: ["admin", "support-tickets"],
    request: { method: "GET", url: "/admin/support-tickets" },
    schema: supportTicketsSchema,
    options: { meta: { errorMessage: "Support ticket listesi alinamadi." } },
  });

  const updateStatusMutation = useApiMutation({
    schema: updateStatusResponseSchema,
    request: ({ ticketId, status }: { ticketId: string; status: SupportTicketStatus }) => ({
      method: "PATCH",
      url: `/admin/support-tickets/${ticketId}/status`,
      data: { status },
    }),
    options: {
      onSuccess: async (response) => {
        setSelectedTicket((ticket) =>
          ticket && ticket.id === response.id
            ? { ...ticket, status: response.status, updatedAt: response.updatedAt }
            : ticket
        );
        showApiSuccessToast(response, "Ticket durumu guncellendi.");
        await queryClient.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      },
      onError: (error) => showApiErrorToast(error, "Ticket durumu guncellenemedi"),
    },
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const openCount = ticketsQuery.data?.filter((ticket) => ticket.status === "open").length ?? 0;
  const progressCount = ticketsQuery.data?.filter((ticket) => ticket.status === "in_progress").length ?? 0;
  const resolvedCount = ticketsQuery.data?.filter((ticket) => ticket.status === "resolved").length ?? 0;

  const updateSelectedStatus = (status: SupportTicketStatus) => {
    if (!selectedTicket || selectedTicket.status === status) return;
    updateStatusMutation.mutate({ ticketId: selectedTicket.id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Support Tickets</h2>
        <p className="text-sm text-muted-foreground">Kullanicilarin gonderdigi destek talepleri ve hesap bilgileri.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">In progress</p>
            <p className="text-2xl font-bold">{progressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket listesi</CardTitle>
          <CardDescription>Son 500 kayit, en yeni once.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => ticketsQuery.refetch()}>
              Yenile
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Konu</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Gonderen</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Yukleniyor...
                  </TableCell>
                </TableRow>
              ) : ticketsQuery.data?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Badge variant={statusVariants[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[280px]">
                      <p className="truncate font-medium">{ticket.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{ticket.message}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{ticket.category}</TableCell>
                  <TableCell>
                    <p className="font-medium">{ticket.contactName}</p>
                    <p className="text-xs text-muted-foreground">{ticket.contactEmail}</p>
                  </TableCell>
                  <TableCell>
                    {ticket.user ? (
                      <div className="space-y-1">
                        <Badge variant={ticket.user.plan === "premium" ? "default" : "outline"}>
                          {ticket.user.plan}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Public</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!ticketsQuery.isLoading && ticketsQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Support ticket bulunamadi.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject ?? "Ticket detay"}</DialogTitle>
            <DialogDescription>ID: {selectedTicket?.id ?? "-"}</DialogDescription>
          </DialogHeader>

          {selectedTicket ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Durum</p>
                  <p className="font-medium">{statusLabels[selectedTicket.status]}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Kategori</p>
                  <p className="font-medium capitalize">{selectedTicket.category}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Gonderim</p>
                  <p className="font-medium">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedTicket.contactName}</p>
                  <p className="break-all text-xs text-muted-foreground">{selectedTicket.contactEmail}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-xs text-muted-foreground">Account</p>
                  {selectedTicket.user ? (
                    <>
                      <p className="font-medium">{selectedTicket.user.name}</p>
                      <p className="break-all text-xs text-muted-foreground">{selectedTicket.user.email}</p>
                      <Badge className="mt-2" variant={selectedTicket.user.plan === "premium" ? "default" : "outline"}>
                        {selectedTicket.user.plan}
                      </Badge>
                    </>
                  ) : (
                    <p className="font-medium">Public ticket</p>
                  )}
                </div>
              </div>

              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Mesaj</p>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["open", "in_progress", "resolved"] as const).map((status) => (
                <Button
                  key={status}
                  variant={selectedTicket?.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSelectedStatus(status)}
                  disabled={!selectedTicket || updateStatusMutation.isPending}
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
