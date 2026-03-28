import { isAxiosError } from "axios";
import type { z } from "zod";
import { apiEnvelopeSchema, apiErrorItemSchema } from "@/lib/api/schemas";

function humanizeSegment(segment: PropertyKey) {
  return String(segment).replace(/[_.\-]+/g, " ").trim();
}

function formatPath(path: PropertyKey[]) {
  return path.map(humanizeSegment).join(" > ");
}

function normalizeErrorEntry(entry: unknown) {
  if (typeof entry === "string") {
    return entry;
  }

  const parsed = apiErrorItemSchema.safeParse(entry);

  if (!parsed.success || typeof parsed.data === "string") {
    return null;
  }

  const location =
    typeof parsed.data.path === "string"
      ? humanizeSegment(parsed.data.path)
      : Array.isArray(parsed.data.path)
        ? formatPath(parsed.data.path)
        : parsed.data.field
          ? humanizeSegment(parsed.data.field)
          : "";

  const message =
    parsed.data.message ?? parsed.data.detail ?? parsed.data.error ?? null;

  if (!message) {
    return location || null;
  }

  return location ? `${location}: ${message}` : message;
}

export function formatValidationIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => {
    const path = formatPath(issue.path);
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export function extractApiData(payload: unknown) {
  const parsed = apiEnvelopeSchema.safeParse(payload);

  if (!parsed.success || parsed.data.data === undefined) {
    return payload;
  }

  return parsed.data.data;
}

export function getReadableApiDetails(value: unknown) {
  if (isAxiosError(value)) {
    return getReadableApiDetails(value.response?.data);
  }

  const parsed = apiEnvelopeSchema.safeParse(value);

  if (!parsed.success) {
    return [];
  }

  return (parsed.data.errors ?? [])
    .map(normalizeErrorEntry)
    .filter((detail): detail is string => Boolean(detail));
}

export function getReadableApiMessage(
  value: unknown,
  fallback = "Beklenmeyen bir hata olustu.",
) {
  if (isAxiosError(value)) {
    const details = getReadableApiDetails(value.response?.data);

    if (details.length > 0) {
      return details[0];
    }

    return getReadableApiMessage(value.response?.data, value.message || fallback);
  }

  if (value instanceof Error) {
    return value.message || fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  const parsed = apiEnvelopeSchema.safeParse(value);

  if (!parsed.success) {
    return fallback;
  }

  return parsed.data.message ?? parsed.data.detail ?? parsed.data.error ?? fallback;
}

export function getReadableApiSuccessMessage(
  value: unknown,
  fallback = "Islem basariyla tamamlandi.",
) {
  return getReadableApiMessage(value, fallback);
}
