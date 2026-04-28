import { prisma } from "../../lib/prisma";
import { assertAdminAccess } from "../../shared/auth/admin-access";
import type { AuthContextUser } from "../../shared/types/auth";

export const adminService = {
  async listUsers(user: AuthContextUser) {
    assertAdminAccess(user);

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
    assertAdminAccess(user);

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

  async updateUserPlan(adminUser: AuthContextUser, userId: string, plan: "basic" | "premium") {
    assertAdminAccess(adminUser);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    return user;
  },
};
