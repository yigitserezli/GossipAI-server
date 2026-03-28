import { z } from "zod";

export const createGossipSchema = z.object({
  title: z.string().trim().min(3),
  content: z.string().trim().min(10)
});

export type CreateGossipInput = z.infer<typeof createGossipSchema>;
