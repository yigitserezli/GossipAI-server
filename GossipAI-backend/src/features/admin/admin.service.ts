import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import type { AuthContextUser } from "../../shared/types/auth";

const parseDeveloperEmails = () =>
  (env.DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

export const assertDeveloper = (user: AuthContextUser) => {
  const developerEmails = parseDeveloperEmails();
  if (developerEmails.length === 0 || !developerEmails.includes(user.email.toLowerCase())) {
    throw new AppError("Admin access required.", 403, undefined, "FORBIDDEN");
  }
};

export const adminService = {
  async listUsers(user: AuthContextUser) {
    assertDeveloper(user);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        preferredLanguage: true,
        lastAppActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
            pushDevices: true,
          },
        },
        dailyUsages: {
          select: { count: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      preferredLanguage: u.preferredLanguage,
      lastAppActiveAt: u.lastAppActiveAt,
      createdAt: u.createdAt,
      totalPrompts: u.dailyUsages.reduce((acc, d) => acc + d.count, 0),
      conversationCount: u._count.conversations,
      deviceCount: u._count.pushDevices,
    }));
  },

  async listDevices(user: AuthContextUser) {
    assertDeveloper(user);

    return prisma.pushDevice.findMany({
      select: {
        id: true,
        token: true,
        platform: true,
        appVersion: true,
        deviceLanguage: true,
        notificationsEnabled: true,
        lastSeenAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            plan: true,
          },
        },
      },
      orderBy: { lastSeenAt: "desc" },
      take: 500,
    });
  },
};
