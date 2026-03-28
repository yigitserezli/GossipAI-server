"use client";

import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiQuery } from "@/lib/query/hooks";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  plan: z.enum(["free", "premium"]),
  preferredLanguage: z.string(),
  lastAppActiveAt: z.string().nullable().optional(),
  createdAt: z.string(),
  totalPrompts: z.number(),
  conversationCount: z.number(),
  deviceCount: z.number(),
});

const usersSchema = z.array(userSchema);

export function AdminUsers() {
  const usersQuery = useApiQuery({
    queryKey: ["admin", "users"],
    request: { method: "GET", url: "/admin/users" },
    schema: usersSchema,
    options: { meta: { errorMessage: "Kullanici listesi alinamadi." } },
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const premiumCount = usersQuery.data?.filter((u) => u.plan === "premium").length ?? 0;
  const freeCount = usersQuery.data?.filter((u) => u.plan === "free").length ?? 0;
  const totalPrompts = usersQuery.data?.reduce((acc, u) => acc + u.totalPrompts, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Kullanicilar</h2>
        <p className="text-sm text-muted-foreground">Kayitli kullanicilarin plan ve kullanim bilgileri.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Toplam kullanici</p>
            <p className="text-2xl font-bold">{usersQuery.data?.length ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Premium / Free</p>
            <p className="text-2xl font-bold">
              {premiumCount}
              <span className="text-base font-normal text-muted-foreground"> / {freeCount}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Toplam prompt</p>
            <p className="text-2xl font-bold">{totalPrompts.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanici listesi</CardTitle>
          <CardDescription>Son 500 kayit, en yeni once.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={() => usersQuery.refetch()}>
              Yenile
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Dil</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Konusma</TableHead>
                <TableHead>Cihaz</TableHead>
                <TableHead>Son aktif</TableHead>
                <TableHead>Kayit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Yukleniyor...
                  </TableCell>
                </TableRow>
              ) : usersQuery.data?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.plan === "premium" ? "default" : "outline"}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.preferredLanguage}</TableCell>
                  <TableCell>{user.totalPrompts.toLocaleString()}</TableCell>
                  <TableCell>{user.conversationCount}</TableCell>
                  <TableCell>{user.deviceCount}</TableCell>
                  <TableCell>{formatDate(user.lastAppActiveAt)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!usersQuery.isLoading && usersQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Kullanici bulunamadi.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
