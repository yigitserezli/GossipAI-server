"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation, useApiQuery } from "@/lib/query/hooks";
import { showApiErrorToast, showApiSuccessToast, showValidationErrorToast } from "@/lib/toast/notify";
import { useQueryClient } from "@tanstack/react-query";

type SupportedLanguageKey =
  | "tr"
  | "en"
  | "de"
  | "fr"
  | "it"
  | "es"
  | "ru"
  | "zh"
  | "ja"
  | "ko"
  | "uk"
  | "pt"
  | "es-419";

const LANGUAGE_LABELS: Record<SupportedLanguageKey, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  fr: "French",
  it: "Italian",
  es: "Spanish",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  uk: "Ukrainian",
  pt: "Portuguese",
  "es-419": "Spanish (LATAM)",
};

const ALL_LANGUAGES = Object.keys(LANGUAGE_LABELS) as SupportedLanguageKey[];

const scenarioOptions = [
  "inactivity_3d",
  "inactivity_7d",
  "inactivity_10d",
  "inactivity_15d",
  "inactivity_30d",
  "weekly_free_upsell",
  "manual_broadcast",
] as const;

const campaignStatusOptions = ["draft", "scheduled", "sent", "cancelled"] as const;
const planOptions = ["basic", "premium"] as const;
const deliveryStatusOptions = ["queued", "sent", "failed"] as const;

const campaignSchema = z.object({
  id: z.string(),
  scenario: z.enum(scenarioOptions),
  status: z.enum(campaignStatusOptions),
  targetPlan: z.enum(planOptions).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  sentAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

const campaignsSchema = z.array(campaignSchema);

const campaignStatsSchema = z.object({
  campaign: campaignSchema,
  stats: z.object({
    total: z.number(),
    successRate: z.number(),
    byStatus: z.object({
      queued: z.number(),
      sent: z.number(),
      failed: z.number(),
    }),
  }),
});

const deliverySchema = z.object({
  id: z.string(),
  status: z.enum(deliveryStatusOptions),
  sentAt: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    preferredLanguage: z.string(),
    plan: z.enum(planOptions),
  }),
  device: z.object({
    id: z.string(),
    platform: z.enum(["ios", "android", "web"]),
    deviceLanguage: z.string().nullable().optional(),
    notificationsEnabled: z.boolean(),
    token: z.string(),
  }),
});

const deliveriesSchema = z.array(deliverySchema);

const dispatchResultSchema = z.object({
  campaignId: z.string(),
  scenario: z.string(),
  targetDevices: z.number(),
  sent: z.number(),
  failed: z.number(),
});

const automationResultSchema = z.object({
  inactivity: z.array(
    z.object({
      scenario: z.string(),
      sent: z.number(),
      failed: z.number(),
      targetDevices: z.number(),
    })
  ),
  weeklyFreeUpsell: z.object({
    sent: z.number(),
    failed: z.number(),
    targetDevices: z.number(),
  }),
  scheduled: z.array(
    z.object({
      campaignId: z.string(),
      sent: z.number(),
      failed: z.number(),
      targetDevices: z.number(),
    })
  ),
});

const retryDeliveryResultSchema = z.object({
  campaignId: z.string(),
  sourceDeliveryId: z.string(),
  retriedDeliveryId: z.string(),
  status: z.enum(["queued", "sent", "failed"]),
  errorMessage: z.string().optional(),
});

const autoTranslateResultSchema = z.object({
  titleByLanguage: z.record(z.string(), z.string()),
  bodyByLanguage: z.record(z.string(), z.string()),
});

const createCampaignFormSchema = z.object({
  scenario: z.enum(scenarioOptions),
  status: z.enum(["draft", "scheduled"] as const),
  titleEn: z.string().min(3, "Title EN min 3 karakter"),
  bodyEn: z.string().min(5, "Body EN min 5 karakter"),
  deepLink: z.string().min(1),
  targetPlan: z.enum(["all", ...planOptions] as const),
  scheduledAt: z.string().optional(),
});

export function AdminNotifications() {
  const queryClient = useQueryClient();

  const [scenarioFilter, setScenarioFilter] = useState<"all" | (typeof scenarioOptions)[number]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof campaignStatusOptions)[number]>("all");
  const [planFilter, setPlanFilter] = useState<"all" | (typeof planOptions)[number]>("all");

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<"all" | (typeof deliveryStatusOptions)[number]>("all");
  const [deliveryLimit, setDeliveryLimit] = useState(100);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

  const [form, setForm] = useState({
    scenario: "manual_broadcast" as (typeof scenarioOptions)[number],
    status: "draft" as "draft" | "scheduled",
    titleEn: "",
    bodyEn: "",
    deepLink: "gossipai://tabs/home",
    targetPlan: "all" as "all" | (typeof planOptions)[number],
    scheduledAt: "",
  });

  const [translations, setTranslations] = useState<{
    titleByLanguage: Partial<Record<SupportedLanguageKey, string>>;
    bodyByLanguage: Partial<Record<SupportedLanguageKey, string>>;
  }>({ titleByLanguage: {}, bodyByLanguage: {} });

  const [showTranslationPreview, setShowTranslationPreview] = useState(false);
  const hasTranslations = Object.keys(translations.titleByLanguage).length > 0;

  const campaignsQuery = useApiQuery({
    queryKey: ["notifications", "campaigns", scenarioFilter, statusFilter, planFilter],
    request: {
      method: "GET",
      url: "/notifications/campaigns",
      params: {
        ...(scenarioFilter !== "all" ? { scenario: scenarioFilter } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(planFilter !== "all" ? { targetPlan: planFilter } : {}),
      },
    },
    schema: campaignsSchema,
    options: {
      meta: { errorMessage: "Campaign listesi alinamadi." },
    },
  });

  const selectedCampaign = useMemo(
    () => campaignsQuery.data?.find((item) => item.id === selectedCampaignId) ?? null,
    [campaignsQuery.data, selectedCampaignId]
  );

  const statsQuery = useApiQuery({
    queryKey: ["notifications", "campaign", selectedCampaignId, "stats"],
    request: {
      method: "GET",
      url: selectedCampaignId ? `/notifications/campaigns/${selectedCampaignId}/stats` : "/notifications/campaigns",
    },
    schema: campaignStatsSchema,
    options: {
      enabled: Boolean(selectedCampaignId),
      meta: { errorMessage: "Campaign istatistikleri alinamadi." },
    },
  });

  const deliveriesQuery = useApiQuery({
    queryKey: ["notifications", "campaign", selectedCampaignId, "deliveries", deliveryStatusFilter, deliveryLimit],
    request: {
      method: "GET",
      url: selectedCampaignId
        ? `/notifications/campaigns/${selectedCampaignId}/deliveries`
        : "/notifications/campaigns",
      params: {
        ...(deliveryStatusFilter !== "all" ? { status: deliveryStatusFilter } : {}),
        limit: deliveryLimit,
      },
    },
    schema: deliveriesSchema,
    options: {
      enabled: Boolean(selectedCampaignId),
      meta: { errorMessage: "Delivery loglari alinamadi." },
    },
  });

  const selectedDelivery = useMemo(
    () => deliveriesQuery.data?.find((item) => item.id === selectedDeliveryId) ?? null,
    [deliveriesQuery.data, selectedDeliveryId]
  );

  const autoTranslateMutation = useApiMutation({
    schema: autoTranslateResultSchema,
    request: (payload: { titleEn: string; bodyEn: string }) => ({
      method: "POST",
      url: "/notifications/campaigns/auto-translate",
      data: payload,
    }),
    options: {
      onSuccess: (response) => {
        const data = response.data ?? (response as unknown as { titleByLanguage: Record<string, string>; bodyByLanguage: Record<string, string> });
        setTranslations({
          titleByLanguage: data.titleByLanguage as Partial<Record<SupportedLanguageKey, string>>,
          bodyByLanguage: data.bodyByLanguage as Partial<Record<SupportedLanguageKey, string>>,
        });
        setShowTranslationPreview(true);
        showApiSuccessToast(response, "Tum diller cevirildi.");
      },
      onError: (error) => showApiErrorToast(error, "Ceviri basarisiz"),
    },
  });

  const createCampaignMutation = useApiMutation({
    schema: campaignSchema,
    request: (payload: z.infer<typeof createCampaignFormSchema>) => {
      const titleByLanguage: Record<string, string> = {
        en: payload.titleEn,
        ...translations.titleByLanguage,
      };
      const bodyByLanguage: Record<string, string> = {
        en: payload.bodyEn,
        ...translations.bodyByLanguage,
      };
      // Ensure all supported languages have a value (fallback to EN)
      for (const lang of ALL_LANGUAGES) {
        if (!titleByLanguage[lang]) titleByLanguage[lang] = payload.titleEn;
        if (!bodyByLanguage[lang]) bodyByLanguage[lang] = payload.bodyEn;
      }
      return {
        method: "POST",
        url: "/notifications/campaigns",
        data: {
          scenario: payload.scenario,
          status: payload.status,
          titleByLanguage,
          bodyByLanguage,
          deepLink: payload.deepLink,
          targetPlan: payload.targetPlan === "all" ? undefined : payload.targetPlan,
          scheduledAt:
            payload.status === "scheduled" && payload.scheduledAt
              ? new Date(payload.scheduledAt).toISOString()
              : undefined,
        },
      };
    },
    options: {
      onSuccess: async (response) => {
        showApiSuccessToast(response, "Campaign olusturuldu.");
        setTranslations({ titleByLanguage: {}, bodyByLanguage: {} });
        setShowTranslationPreview(false);
        await queryClient.invalidateQueries({ queryKey: ["notifications", "campaigns"] });
      },
      onError: (error) => showApiErrorToast(error, "Campaign olusturulamadi"),
    },
  });

  const dispatchCampaignMutation = useApiMutation({
    schema: dispatchResultSchema,
    request: (campaignId: string) => ({
      method: "POST",
      url: `/notifications/campaigns/${campaignId}/dispatch`,
    }),
    options: {
      onSuccess: async (response) => {
        showApiSuccessToast(response, "Campaign gonderildi.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["notifications", "campaigns"] }),
          queryClient.invalidateQueries({ queryKey: ["notifications", "campaign", selectedCampaignId] }),
        ]);
      },
      onError: (error) => showApiErrorToast(error, "Campaign gonderimi basarisiz"),
    },
  });

  const cancelCampaignMutation = useApiMutation({
    schema: campaignSchema,
    request: (campaignId: string) => ({
      method: "POST",
      url: `/notifications/campaigns/${campaignId}/cancel`,
    }),
    options: {
      onSuccess: async (response) => {
        showApiSuccessToast(response, "Campaign iptal edildi.");
        await queryClient.invalidateQueries({ queryKey: ["notifications", "campaigns"] });
      },
      onError: (error) => showApiErrorToast(error, "Campaign iptal edilemedi"),
    },
  });

  const runAutomationMutation = useApiMutation({
    schema: automationResultSchema,
    request: () => ({
      method: "POST",
      url: "/notifications/automation/run",
    }),
    options: {
      onSuccess: async (response) => {
        showApiSuccessToast(response, "Automation tick tamamlandi.");
        await queryClient.invalidateQueries({ queryKey: ["notifications", "campaigns"] });
      },
      onError: (error) => showApiErrorToast(error, "Automation tetiklenemedi"),
    },
  });

  const retryDeliveryMutation = useApiMutation({
    schema: retryDeliveryResultSchema,
    request: (payload: { campaignId: string; deliveryId: string }) => ({
      method: "POST",
      url: `/notifications/campaigns/${payload.campaignId}/deliveries/${payload.deliveryId}/retry`,
    }),
    options: {
      onSuccess: async (response) => {
        showApiSuccessToast(response, "Delivery tekrar gonderildi.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["notifications", "campaign", selectedCampaignId, "deliveries"] }),
          queryClient.invalidateQueries({ queryKey: ["notifications", "campaign", selectedCampaignId, "stats"] }),
        ]);
      },
      onError: (error) => showApiErrorToast(error, "Delivery retry basarisiz"),
    },
  });

  const onAutoTranslate = () => {
    if (!form.titleEn || form.titleEn.length < 3) {
      showApiErrorToast({ message: "Title EN en az 3 karakter olmali." }, "Form hatasi");
      return;
    }
    if (!form.bodyEn || form.bodyEn.length < 5) {
      showApiErrorToast({ message: "Body EN en az 5 karakter olmali." }, "Form hatasi");
      return;
    }
    autoTranslateMutation.mutate({ titleEn: form.titleEn, bodyEn: form.bodyEn });
  };

  const onCreateCampaign = () => {
    const parsed = createCampaignFormSchema.safeParse(form);
    if (!parsed.success) {
      showValidationErrorToast(parsed.error, "Campaign formu hatali");
      return;
    }
    if (parsed.data.status === "scheduled" && !parsed.data.scheduledAt) {
      showApiErrorToast({ message: "Scheduled campaign icin tarih secmelisin." }, "Form hatasi");
      return;
    }
    createCampaignMutation.mutate(parsed.data);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const maskToken = (token: string) => {
    if (token.length < 14) return token;
    return `${token.slice(0, 8)}...${token.slice(-6)}`;
  };

  const copyToClipboard = async (value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      showApiErrorToast({ message: "Clipboard API bu tarayicida yok." }, "Kopyalanamadi");
      return;
    }
    await navigator.clipboard.writeText(value);
    showApiSuccessToast({ message: "Kopyalandi." }, "Basarili");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Campaign olusturma, dispatch, automation ve delivery gozlem.</p>
        </div>
        <Button
          onClick={() => runAutomationMutation.mutate(undefined)}
          disabled={runAutomationMutation.isPending}
        >
          Automation run
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign olustur</CardTitle>
            <CardDescription>
              EN icerik gir, &quot;AI ile Cevir&quot; butonuna bas, 13 dile otomatik cevirilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Scenario</p>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.scenario}
                  onChange={(e) => setForm((prev) => ({ ...prev, scenario: e.target.value as typeof form.scenario }))}
                >
                  {scenarioOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as typeof form.status }))}
                >
                  <option value="draft">draft</option>
                  <option value="scheduled">scheduled</option>
                </select>
              </div>
            </div>
            {form.status === "scheduled" ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Schedule</p>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Target plan</p>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.targetPlan}
                onChange={(e) => setForm((prev) => ({ ...prev, targetPlan: e.target.value as typeof form.targetPlan }))}
              >
                <option value="all">all</option>
                <option value="basic">basic</option>
                <option value="premium">premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">İçerik (English)</p>
              <Input
                placeholder="Title EN *"
                value={form.titleEn}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, titleEn: e.target.value }));
                  setTranslations({ titleByLanguage: {}, bodyByLanguage: {} });
                  setShowTranslationPreview(false);
                }}
              />
              <Textarea
                placeholder="Body EN *"
                value={form.bodyEn}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, bodyEn: e.target.value }));
                  setTranslations({ titleByLanguage: {}, bodyByLanguage: {} });
                  setShowTranslationPreview(false);
                }}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={onAutoTranslate}
              disabled={autoTranslateMutation.isPending || !form.titleEn || !form.bodyEn}
            >
              {autoTranslateMutation.isPending ? "Ceviriliyor..." : "🌐 AI ile Cevir (13 dil)"}
            </Button>

            {showTranslationPreview && hasTranslations && (
              <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground">Ceviri Onizleme</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {ALL_LANGUAGES.filter((l) => l !== "en").map((lang) => (
                    <div key={lang} className="text-xs space-y-0.5">
                      <p className="font-medium text-foreground">{LANGUAGE_LABELS[lang]} ({lang})</p>
                      <p className="text-muted-foreground">{translations.titleByLanguage[lang] ?? "—"}</p>
                      <p className="text-muted-foreground">{translations.bodyByLanguage[lang] ?? "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Input
              placeholder="Deep link"
              value={form.deepLink}
              onChange={(e) => setForm((prev) => ({ ...prev, deepLink: e.target.value }))}
            />
            <Button
              onClick={onCreateCampaign}
              disabled={createCampaignMutation.isPending || !hasTranslations}
              className="w-full"
            >
              {hasTranslations ? "Campaign olustur" : "Once AI ile cevir"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign listesi</CardTitle>
            <CardDescription>Filtrele, sec ve aksiyon uygula.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={scenarioFilter}
                onChange={(e) => setScenarioFilter(e.target.value as typeof scenarioFilter)}
              >
                <option value="all">all scenarios</option>
                {scenarioOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">all status</option>
                {campaignStatusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
              >
                <option value="all">all plans</option>
                {planOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignsQuery.data?.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className={campaign.id === selectedCampaignId ? "bg-muted/50" : "cursor-pointer hover:bg-muted/30"}
                    onClick={() => setSelectedCampaignId(campaign.id)}
                  >
                    <TableCell>{campaign.scenario}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "sent" ? "default" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.targetPlan ?? "all"}</TableCell>
                    <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatchCampaignMutation.mutate(campaign.id);
                          }}
                          disabled={dispatchCampaignMutation.isPending || campaign.status === "sent" || campaign.status === "cancelled"}
                        >
                          Dispatch
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelCampaignMutation.mutate(campaign.id);
                          }}
                          disabled={cancelCampaignMutation.isPending || (campaign.status !== "draft" && campaign.status !== "scheduled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {campaignsQuery.data && campaignsQuery.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Campaign bulunamadi.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Secili campaign detay</CardTitle>
            <CardDescription>Stats ve delivery loglari.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCampaign ? (
              <p className="text-sm text-muted-foreground">Detay icin campaign sec.</p>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-semibold">{statsQuery.data?.stats.total ?? 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Sent</p>
                    <p className="text-xl font-semibold">{statsQuery.data?.stats.byStatus.sent ?? 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-xl font-semibold">{statsQuery.data?.stats.byStatus.failed ?? 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Success rate</p>
                    <p className="text-xl font-semibold">{statsQuery.data?.stats.successRate ?? 0}%</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={deliveryStatusFilter}
                    onChange={(e) => setDeliveryStatusFilter(e.target.value as typeof deliveryStatusFilter)}
                  >
                    <option value="all">all deliveries</option>
                    {deliveryStatusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={deliveryLimit}
                    onChange={(e) => setDeliveryLimit(Math.max(1, Math.min(500, Number(e.target.value) || 100)))}
                    className="w-28"
                  />
                  <Button variant="outline" onClick={() => deliveriesQuery.refetch()}>
                    Yenile
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Lang</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveriesQuery.data?.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>{delivery.status}</TableCell>
                        <TableCell>{delivery.user.email}</TableCell>
                        <TableCell>{delivery.user.preferredLanguage}</TableCell>
                        <TableCell>{delivery.device.platform}</TableCell>
                        <TableCell className="max-w-45 truncate">{maskToken(delivery.device.token)}</TableCell>
                        <TableCell>{formatDate(delivery.sentAt ?? delivery.createdAt)}</TableCell>
                        <TableCell className="max-w-55 truncate">{delivery.errorMessage ?? "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDeliveryId(delivery.id)}
                            >
                              Detay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                retryDeliveryMutation.isPending ||
                                delivery.status !== "failed" ||
                                !selectedCampaignId
                              }
                              onClick={() => {
                                if (!selectedCampaignId) return;
                                retryDeliveryMutation.mutate({
                                  campaignId: selectedCampaignId,
                                  deliveryId: delivery.id,
                                });
                              }}
                            >
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deliveriesQuery.data && deliveriesQuery.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Delivery kaydi yok.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(selectedDelivery)} onOpenChange={(open) => !open && setSelectedDeliveryId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delivery detay</DialogTitle>
            <DialogDescription>ID: {selectedDelivery?.id ?? "-"}</DialogDescription>
          </DialogHeader>

          {selectedDelivery ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedDelivery.status}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-medium">{selectedDelivery.device.platform}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selectedDelivery.user.email}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="font-medium">{selectedDelivery.user.preferredLanguage}</p>
                </div>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Token</p>
                <p className="break-all font-mono text-xs">{selectedDelivery.device.token}</p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Error</p>
                <p>{selectedDelivery.errorMessage ?? "-"}</p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Sent At</p>
                <p>{formatDate(selectedDelivery.sentAt ?? selectedDelivery.createdAt)}</p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedDelivery && void copyToClipboard(selectedDelivery.device.token)}
              disabled={!selectedDelivery}
            >
              Token kopyala
            </Button>
            <Button variant="outline" onClick={() => setSelectedDeliveryId(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
