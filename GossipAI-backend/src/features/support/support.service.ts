import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import type { AuthContextUser } from "../../shared/types/auth";
import type { CreateSupportTicketInput } from "./support.schema";

export const supportService = {
  async createTicket(input: CreateSupportTicketInput, user?: AuthContextUser | null) {
    const storedUser = user
      ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, name: true, email: true },
        })
      : null;

    const contactName = storedUser?.name ?? input.contactName?.trim();
    const contactEmail = storedUser?.email ?? input.contactEmail?.trim().toLowerCase();

    if (!contactName || !contactEmail) {
      throw new AppError(
        "Name and email are required for support tickets.",
        400,
        {
          fieldErrors: {
            contactName: contactName ? [] : ["Name is required."],
            contactEmail: contactEmail ? [] : ["Email is required."],
          },
        },
        "SUPPORT_CONTACT_REQUIRED",
        true
      );
    }

    return prisma.supportTicket.create({
      data: {
        userId: storedUser?.id,
        contactName,
        contactEmail,
        category: input.category,
        subject: input.subject,
        message: input.message,
      },
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        category: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });
  },
};
