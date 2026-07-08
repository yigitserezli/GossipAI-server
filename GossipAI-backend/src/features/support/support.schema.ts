import { z } from "zod";

export const supportTicketCategorySchema = z.enum([
  "account",
  "billing",
  "bug",
  "feedback",
  "general",
]);

export const createSupportTicketSchema = z.object({
  contactName: z.string().trim().min(2).max(120).optional(),
  contactEmail: z.string().trim().email().max(254).optional(),
  category: supportTicketCategorySchema.default("general"),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
