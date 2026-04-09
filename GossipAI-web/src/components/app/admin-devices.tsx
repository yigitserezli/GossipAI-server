"use client";

import { useState } from "react";
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
import { useApiQuery } from "@/lib/query/hooks";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast/notify";

const deviceSchema = z.object({
  id: z.string(),
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  appVersion: z.string().nullable().optional(),
  deviceLanguage: z.string().nullable().optional(),
  notificationsEnabled: z.boolean(),
  lastSeenAt: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    plan: z.enum(["basic", "premium"]),
  }),
});

const devicesSchema = z.array(deviceSchema);

export function AdminDevices() {
  const [selectedDevice, setSelectedDevice] = useState<z.infer<typeof deviceSchema> | null>(null);

  const devicesQuery = useApiQuery({
    queryKey: ["admin", "devices"],
    request: { method: "GET", url: "/admin/devices" },
    schema: devicesSchema,
    options: { meta: { errorMessage: "Cihaz listesi alinamadi." } },
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const maskToken = (token: string) => {
    if (token.length < 14) return token;
    return `${token.slice(0, 10)}...${token.slice(-8)}`;
  };

  const copyToClipboard = async (value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      showApiErrorToast({ message: "Clipboard API bu tarayicida yok." }, "Kopyalanamadi");
      return;
    }
    await navigator.clipboard.writeText(value);
    showApiSuccessToast({ message: "Token kopyalandi." }, "Basarili");
  };

  const iosCount = devicesQuery.data?.filter((d) => d.platform === "ios").length ?? 0;
  const androidCount = devicesQuery.data?.filter((d) => d.platform === "android").length ?? 0;
  const enabledCount = devicesQuery.data?.filter((d) => d.notificationsEnabled).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Push Cihazlar</h2>
        <p className="text-sm text-muted-foreground">Kayitli push notification cihazlari ve tokenlari.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Toplam cihaz</p>
            <p className="text-2xl font-bold">{devicesQuery.data?.length ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">iOS / Android</p>
            <p className="text-2xl font-bold">
              {iosCount}
              <span className="text-base font-normal text-muted-foreground"> / {androidCount}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Bildirim acik</p>
            <p className="text-2xl font-bold">{enabledCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cihaz listesi</CardTitle>
          <CardDescription>Son 500 kayit, en son gorulen once.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => devicesQuery.refetch()}>
              Yenile
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>App versiyonu</TableHead>
                <TableHead>Dil</TableHead>
                <TableHead>Bildirim</TableHead>
                <TableHead>Son gorulme</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devicesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Yukleniyor...
                  </TableCell>
                </TableRow>
              ) : devicesQuery.data?.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.user.email}</TableCell>
                  <TableCell>
                    <Badge variant={device.user.plan === "premium" ? "default" : "outline"}>
                      {device.user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{device.platform}</TableCell>
                  <TableCell className="font-mono text-xs">{maskToken(device.token)}</TableCell>
                  <TableCell>{device.appVersion ?? "-"}</TableCell>
                  <TableCell>{device.deviceLanguage ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={device.notificationsEnabled ? "default" : "secondary"}>
                      {device.notificationsEnabled ? "acik" : "kapali"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(device.lastSeenAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDevice(device)}
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!devicesQuery.isLoading && devicesQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Cihaz bulunamadi.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedDevice)} onOpenChange={(open) => !open && setSelectedDevice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cihaz detay</DialogTitle>
            <DialogDescription>ID: {selectedDevice?.id ?? "-"}</DialogDescription>
          </DialogHeader>

          {selectedDevice ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-medium">{selectedDevice.platform}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">App versiyonu</p>
                  <p className="font-medium">{selectedDevice.appVersion ?? "-"}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selectedDevice.user.email}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Dil</p>
                  <p className="font-medium">{selectedDevice.deviceLanguage ?? "-"}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Bildirim</p>
                  <p className="font-medium">{selectedDevice.notificationsEnabled ? "Acik" : "Kapali"}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Son gorulme</p>
                  <p className="font-medium">{formatDate(selectedDevice.lastSeenAt)}</p>
                </div>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Token</p>
                <p className="break-all font-mono text-xs mt-1">{selectedDevice.token}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedDevice && void copyToClipboard(selectedDevice.token)}
              disabled={!selectedDevice}
            >
              Token kopyala
            </Button>
            <Button variant="outline" onClick={() => setSelectedDevice(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
