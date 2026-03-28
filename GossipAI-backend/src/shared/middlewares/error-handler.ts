import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";

type FieldErrors = Record<string, string[]>;

const toFieldErrors = (details: unknown): FieldErrors | null => {
  if (!details || typeof details !== "object") {
    return null;
  }

  if (!("fieldErrors" in details)) {
    return null;
  }

  const rawFieldErrors = (details as { fieldErrors?: unknown }).fieldErrors;

  if (!rawFieldErrors || typeof rawFieldErrors !== "object") {
    return null;
  }

  const parsedFieldErrors: FieldErrors = {};

  for (const [field, value] of Object.entries(rawFieldErrors as Record<string, unknown>)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const messages = value.filter((item): item is string => typeof item === "string" && item.length > 0);

    if (messages.length > 0) {
      parsedFieldErrors[field] = messages;
    }
  }

  return Object.keys(parsedFieldErrors).length > 0 ? parsedFieldErrors : null;
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    const shouldExposeDetails = error.exposeDetails || process.env.NODE_ENV !== "production";

    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fields: toFieldErrors(error.details),
        details: shouldExposeDetails ? error.details ?? null : null
      }
    });
  }

  console.error(error);

  const isDev = process.env.NODE_ENV !== "production";

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: isDev
        ? (error instanceof Error ? `${error.name}: ${error.message}` : String(error))
        : "Something went wrong. Please try again.",
      fields: null,
      details: isDev && error instanceof Error
        ? { stack: error.stack ?? null }
        : null
    }
  });
};
