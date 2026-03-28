"use client";

import type { AxiosRequestConfig } from "axios";
import { z } from "zod";
import apiClient from "@/lib/api/client";
import { ApiValidationError } from "@/lib/api/errors";
import { extractApiData } from "@/lib/api/format";
import { showValidationErrorToast } from "@/lib/toast/notify";

export function parseApiResponse<TSchema extends z.ZodTypeAny>(
  payload: unknown,
  schema: TSchema,
) {
  const parsed = schema.safeParse(extractApiData(payload));

  if (!parsed.success) {
    showValidationErrorToast(parsed.error, "API dogrulama hatasi");
    throw new ApiValidationError(parsed.error, payload);
  }

  return parsed.data;
}

export async function apiRequest<TSchema extends z.ZodTypeAny>(
  config: AxiosRequestConfig,
  schema: TSchema,
) {
  const response = await apiClient.request(config);
  return parseApiResponse(response.data, schema);
}
