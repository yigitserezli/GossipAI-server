import {
  NotificationCampaignStatus,
  NotificationDeliveryStatus,
  NotificationScenario,
  type NotificationCampaign,
  type PushDevice,
  type SubscriptionPlan,
  type User,
} from "@prisma/client";
import { env } from "../../config/env";
import { sendPushToToken } from "../../lib/firebase-admin";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import type { AuthContextUser } from "../../shared/types/auth";
import type {
  ActivityPingInput,
  CreateCampaignInput,
  ListCampaignDeliveriesQueryInput,
  ListCampaignsQueryInput,
  RegisterDeviceInput,
} from "./notifications.schema";

const parseDeveloperEmails = () =>
  (env.DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const assertDeveloper = (user: AuthContextUser) => {
  const developerEmails = parseDeveloperEmails();
  if (developerEmails.length === 0 || !developerEmails.includes(user.email.toLowerCase())) {
    throw new AppError("Admin access required.", 403, undefined, "FORBIDDEN");
  }
};

const scenarioCooldownDays: Record<NotificationScenario, number> = {
  inactivity_3d: 3,
  inactivity_7d: 7,
  inactivity_10d: 10,
  inactivity_15d: 15,
  inactivity_30d: 30,
  weekly_free_upsell: 7,
  manual_broadcast: 0,
};

type DeviceWithUser = PushDevice & { user: User };

const asLocalizedMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v === "string"
  ) as Array<[string, string]>;

  return Object.fromEntries(entries);
};

const pickLocalizedText = (map: Record<string, string>, language?: string | null) => {
  if (language && map[language]) return map[language];
  if (map.en) return map.en;
  if (map.tr) return map.tr;
  const first = Object.values(map)[0];
  return first ?? "";
};

const nowMinusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const shouldSkipByCooldown = async (device: DeviceWithUser, campaign: NotificationCampaign) => {
  const cooldownDays = scenarioCooldownDays[campaign.scenario] ?? 0;
  if (cooldownDays <= 0) return false;

  const recent = await prisma.notificationDelivery.findFirst({
    where: {
      userId: device.userId,
      deviceId: device.id,
      status: NotificationDeliveryStatus.sent,
      sentAt: { gte: nowMinusDays(cooldownDays) },
      campaign: { scenario: campaign.scenario },
    },
    select: { id: true },
  });

  return Boolean(recent);
};

const sendCampaignToDevices = async (campaign: NotificationCampaign, devices: DeviceWithUser[]) => {
  let sent = 0;
  let failed = 0;

  for (const device of devices) {
    if (await shouldSkipByCooldown(device, campaign)) {
      continue;
    }

    const titleMap = asLocalizedMap(campaign.titleByLanguage);
    const bodyMap = asLocalizedMap(campaign.bodyByLanguage);
    const language = device.user.preferredLanguage || device.deviceLanguage || "en";

    const title = pickLocalizedText(titleMap, language);
    const body = pickLocalizedText(bodyMap, language);

    if (!title || !body) {
      failed += 1;
      await prisma.notificationDelivery.create({
        data: {
          campaignId: campaign.id,
          userId: device.userId,
          deviceId: device.id,
          status: NotificationDeliveryStatus.failed,
          errorMessage: "Missing localized campaign content.",
        },
      });
      continue;
    }

    try {
      await sendPushToToken({
        token: device.token,
        title,
        body,
        data: {
          campaignId: campaign.id,
          scenario: campaign.scenario,
          ...(campaign.deepLink ? { deepLink: campaign.deepLink } : {}),
        },
      });

      sent += 1;
      await prisma.notificationDelivery.create({
        data: {
          campaignId: campaign.id,
          userId: device.userId,
          deviceId: device.id,
          status: NotificationDeliveryStatus.sent,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      failed += 1;
      await prisma.notificationDelivery.create({
        data: {
          campaignId: campaign.id,
          userId: device.userId,
          deviceId: device.id,
          status: NotificationDeliveryStatus.failed,
          errorMessage: error instanceof Error ? error.message : "Unknown push error",
        },
      });
    }
  }

  return { sent, failed };
};

const getEligibleDevicesForCampaign = async (campaign: NotificationCampaign) => {
  const planFilter = campaign.targetPlan ? { plan: campaign.targetPlan } : {};

  return prisma.pushDevice.findMany({
    where: {
      notificationsEnabled: true,
      user: {
        ...planFilter,
      },
    },
    include: {
      user: true,
    },
  });
};

const getTemplateByScenario = async (scenario: NotificationScenario) => {
  return prisma.notificationCampaign.findFirst({
    where: { scenario },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
};

const getInactiveDevices = async (minDays: number, maxDaysExclusive?: number) => {
  const olderThanOrEqual = nowMinusDays(minDays);
  const newerThan = typeof maxDaysExclusive === "number" ? nowMinusDays(maxDaysExclusive) : undefined;

  const lastActiveFilter = newerThan
    ? { lte: olderThanOrEqual, gt: newerThan }
    : { lte: olderThanOrEqual };

  const createdAtFilter = newerThan
    ? { lte: olderThanOrEqual, gt: newerThan }
    : { lte: olderThanOrEqual };

  return prisma.pushDevice.findMany({
    where: {
      notificationsEnabled: true,
      user: {
        OR: [
          { lastAppActiveAt: lastActiveFilter },
          { lastAppActiveAt: null, createdAt: createdAtFilter },
        ],
      },
    },
    include: {
      user: true,
    },
  });
};

const getFreeDevices = async () => {
  return prisma.pushDevice.findMany({
    where: {
      notificationsEnabled: true,
      user: {
        plan: "basic",
      },
    },
    include: {
      user: true,
    },
  });
};

export const notificationsService = {
  async registerDevice(user: AuthContextUser, input: RegisterDeviceInput) {
    const device = await prisma.pushDevice.upsert({
      where: { token: input.token },
      update: {
        userId: user.id,
        platform: input.platform,
        appVersion: input.appVersion,
        deviceLanguage: input.deviceLanguage,
        notificationsEnabled: input.notificationsEnabled ?? true,
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        token: input.token,
        platform: input.platform,
        appVersion: input.appVersion,
        deviceLanguage: input.deviceLanguage,
        notificationsEnabled: input.notificationsEnabled ?? true,
      },
    });

    return device;
  },

  async pingActivity(user: AuthContextUser, input: ActivityPingInput) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastAppActiveAt: new Date() },
    });

    if (input.deviceToken) {
      await prisma.pushDevice.updateMany({
        where: { token: input.deviceToken, userId: user.id },
        data: { lastSeenAt: new Date() },
      });
    }

    return { ok: true as const };
  },

  async createCampaign(user: AuthContextUser, input: CreateCampaignInput) {
    assertDeveloper(user);

    const status = input.status ?? (input.scheduledAt ? NotificationCampaignStatus.scheduled : NotificationCampaignStatus.draft);

    return prisma.notificationCampaign.create({
      data: {
        scenario: input.scenario,
        status,
        titleByLanguage: input.titleByLanguage,
        bodyByLanguage: input.bodyByLanguage,
        deepLink: input.deepLink,
        targetPlan: input.targetPlan,
        scheduledAt: input.scheduledAt,
        createdBy: user.email,
      },
    });
  },

  async dispatchCampaign(user: AuthContextUser, campaignId: string) {
    assertDeveloper(user);

    const campaign = await prisma.notificationCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new AppError("Campaign not found.", 404, undefined, "NOT_FOUND");
    }

    const devices = await getEligibleDevicesForCampaign(campaign);
    const delivery = await sendCampaignToDevices(campaign, devices);

    await prisma.notificationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: NotificationCampaignStatus.sent,
        sentAt: new Date(),
      },
    });

    return {
      campaignId: campaign.id,
      scenario: campaign.scenario,
      targetDevices: devices.length,
      ...delivery,
    };
  },

  async listCampaigns(user: AuthContextUser, filters?: ListCampaignsQueryInput) {
    assertDeveloper(user);

    return prisma.notificationCampaign.findMany({
      where: {
        scenario: filters?.scenario,
        status: filters?.status,
        targetPlan: filters?.targetPlan,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 200,
    });
  },

  async getCampaignStats(user: AuthContextUser, campaignId: string) {
    assertDeveloper(user);

    const campaign = await prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        scenario: true,
        status: true,
        targetPlan: true,
        scheduledAt: true,
        sentAt: true,
        createdAt: true,
      },
    });

    if (!campaign) {
      throw new AppError("Campaign not found.", 404, undefined, "NOT_FOUND");
    }

    const grouped = await prisma.notificationDelivery.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { _all: true },
    });

    const byStatus = {
      queued: 0,
      sent: 0,
      failed: 0,
    };

    for (const row of grouped) {
      byStatus[row.status] = row._count._all;
    }

    const total = byStatus.queued + byStatus.sent + byStatus.failed;
    const successRate = total > 0 ? Number(((byStatus.sent / total) * 100).toFixed(2)) : 0;

    return {
      campaign,
      stats: {
        total,
        successRate,
        byStatus,
      },
    };
  },

  async listCampaignDeliveries(user: AuthContextUser, campaignId: string, filters: ListCampaignDeliveriesQueryInput) {
    assertDeveloper(user);

    const campaign = await prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });

    if (!campaign) {
      throw new AppError("Campaign not found.", 404, undefined, "NOT_FOUND");
    }

    return prisma.notificationDelivery.findMany({
      where: {
        campaignId,
        status: filters.status,
      },
      orderBy: [{ createdAt: "desc" }],
      take: filters.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            preferredLanguage: true,
            plan: true,
          },
        },
        device: {
          select: {
            id: true,
            platform: true,
            deviceLanguage: true,
            notificationsEnabled: true,
            token: true,
          },
        },
      },
    });
  },

  async cancelCampaign(user: AuthContextUser, campaignId: string) {
    assertDeveloper(user);

    const campaign = await prisma.notificationCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new AppError("Campaign not found.", 404, undefined, "NOT_FOUND");
    }

    if (
      campaign.status !== NotificationCampaignStatus.draft &&
      campaign.status !== NotificationCampaignStatus.scheduled
    ) {
      throw new AppError("Only draft or scheduled campaigns can be cancelled.", 409, undefined, "CONFLICT");
    }

    return prisma.notificationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: NotificationCampaignStatus.cancelled,
      },
    });
  },

  async retryDelivery(user: AuthContextUser, campaignId: string, deliveryId: string) {
    assertDeveloper(user);

    const delivery = await prisma.notificationDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        campaign: true,
        user: true,
        device: true,
      },
    });

    if (!delivery || delivery.campaignId !== campaignId) {
      throw new AppError("Delivery not found.", 404, undefined, "NOT_FOUND");
    }

    if (!delivery.device.notificationsEnabled) {
      throw new AppError("Device notifications are disabled.", 409, undefined, "CONFLICT");
    }

    const titleMap = asLocalizedMap(delivery.campaign.titleByLanguage);
    const bodyMap = asLocalizedMap(delivery.campaign.bodyByLanguage);
    const language = delivery.user.preferredLanguage || delivery.device.deviceLanguage || "en";
    const title = pickLocalizedText(titleMap, language);
    const body = pickLocalizedText(bodyMap, language);

    if (!title || !body) {
      throw new AppError("Missing localized campaign content.", 422, undefined, "VALIDATION_ERROR");
    }

    try {
      await sendPushToToken({
        token: delivery.device.token,
        title,
        body,
        data: {
          campaignId: delivery.campaign.id,
          scenario: delivery.campaign.scenario,
          ...(delivery.campaign.deepLink ? { deepLink: delivery.campaign.deepLink } : {}),
        },
      });

      const created = await prisma.notificationDelivery.create({
        data: {
          campaignId: delivery.campaignId,
          userId: delivery.userId,
          deviceId: delivery.deviceId,
          status: NotificationDeliveryStatus.sent,
          sentAt: new Date(),
        },
      });

      return {
        campaignId,
        sourceDeliveryId: delivery.id,
        retriedDeliveryId: created.id,
        status: created.status,
      };
    } catch (error) {
      const failed = await prisma.notificationDelivery.create({
        data: {
          campaignId: delivery.campaignId,
          userId: delivery.userId,
          deviceId: delivery.deviceId,
          status: NotificationDeliveryStatus.failed,
          errorMessage: error instanceof Error ? error.message : "Unknown push error",
        },
      });

      return {
        campaignId,
        sourceDeliveryId: delivery.id,
        retriedDeliveryId: failed.id,
        status: failed.status,
        errorMessage: failed.errorMessage,
      };
    }
  },

  async runScheduledCampaigns() {
    const now = new Date();
    const campaigns = await prisma.notificationCampaign.findMany({
      where: {
        status: NotificationCampaignStatus.scheduled,
        scheduledAt: { lte: now },
      },
      orderBy: [{ scheduledAt: "asc" }],
      take: 50,
    });

    const results: Array<{ campaignId: string; sent: number; failed: number; targetDevices: number }> = [];

    for (const campaign of campaigns) {
      const devices = await getEligibleDevicesForCampaign(campaign);
      const delivery = await sendCampaignToDevices(campaign, devices);

      await prisma.notificationCampaign.update({
        where: { id: campaign.id },
        data: {
          status: NotificationCampaignStatus.sent,
          sentAt: new Date(),
        },
      });

      results.push({
        campaignId: campaign.id,
        sent: delivery.sent,
        failed: delivery.failed,
        targetDevices: devices.length,
      });
    }

    return results;
  },

  async runAutomationTick() {
    const inactivityWindows: Array<{ scenario: NotificationScenario; minDays: number; maxDaysExclusive?: number }> = [
      { scenario: NotificationScenario.inactivity_3d, minDays: 3, maxDaysExclusive: 7 },
      { scenario: NotificationScenario.inactivity_7d, minDays: 7, maxDaysExclusive: 10 },
      { scenario: NotificationScenario.inactivity_10d, minDays: 10, maxDaysExclusive: 15 },
      { scenario: NotificationScenario.inactivity_15d, minDays: 15, maxDaysExclusive: 30 },
      { scenario: NotificationScenario.inactivity_30d, minDays: 30 },
    ];

    const output = {
      inactivity: [] as Array<{ scenario: NotificationScenario; sent: number; failed: number; targetDevices: number }> ,
      weeklyFreeUpsell: { sent: 0, failed: 0, targetDevices: 0 },
      scheduled: [] as Array<{ campaignId: string; sent: number; failed: number; targetDevices: number }>,
    };

    for (const item of inactivityWindows) {
      const campaign = await getTemplateByScenario(item.scenario);
      if (!campaign) continue;

      const devices = await getInactiveDevices(item.minDays, item.maxDaysExclusive);
      const delivery = await sendCampaignToDevices(campaign, devices);

      output.inactivity.push({
        scenario: item.scenario,
        sent: delivery.sent,
        failed: delivery.failed,
        targetDevices: devices.length,
      });
    }

    const weeklyUpsellCampaign = await getTemplateByScenario(NotificationScenario.weekly_free_upsell);
    if (weeklyUpsellCampaign) {
      const devices = await getFreeDevices();
      const delivery = await sendCampaignToDevices(weeklyUpsellCampaign, devices);
      output.weeklyFreeUpsell = {
        sent: delivery.sent,
        failed: delivery.failed,
        targetDevices: devices.length,
      };
    }

    output.scheduled = await this.runScheduledCampaigns();

    return output;
  },

  async runAutomationTickAsAdmin(user: AuthContextUser) {
    assertDeveloper(user);
    return this.runAutomationTick();
  },
};
