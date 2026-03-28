import { z } from "zod";

export const upgradePlanSchema = z.object({
  plan: z.enum(["free", "premium"]),
});

export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;
