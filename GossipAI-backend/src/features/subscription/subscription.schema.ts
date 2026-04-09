import { z } from "zod";

export const upgradePlanSchema = z.object({
  plan: z.enum(["basic", "premium"]),
});

export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;
