import { z } from "zod";

export const apiErrorItemSchema = z.union([
  z.string(),
  z
    .object({
      message: z.string().optional(),
      detail: z.string().optional(),
      error: z.string().optional(),
      field: z.string().optional(),
      path: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]).optional(),
    })
    .passthrough(),
]);

export const apiEnvelopeSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    detail: z.string().optional(),
    error: z.string().optional(),
    data: z.unknown().optional(),
    errors: z.array(apiErrorItemSchema).optional(),
  })
  .passthrough();
