"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiValidationError } from "@/lib/api/errors";
import {
  formatValidationIssues,
  getReadableApiDetails,
  getReadableApiMessage,
  getReadableApiSuccessMessage,
} from "@/lib/api/format";

function renderDetails(details: string[]): ReactNode {
  if (details.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1 text-sm">
      {details.map((detail) => (
        <div key={detail} className="leading-relaxed">
          {detail}
        </div>
      ))}
    </div>
  );
}

export function showValidationErrorToast(
  error: z.ZodError,
  title = "Dogrulama hatasi",
) {
  toast.error(title, {
    description: renderDetails(formatValidationIssues(error.issues)),
  });
}

export function showApiErrorToast(error: unknown, title = "Islem basarisiz") {
  if (error instanceof ApiValidationError) {
    showValidationErrorToast(error.validationError, title);
    return;
  }

  const details = getReadableApiDetails(error);
  const fallbackMessage = getReadableApiMessage(
    error,
    "Beklenmeyen bir hata olustu.",
  );

  toast.error(title, {
    description: renderDetails(
      details.length > 0 ? details : [fallbackMessage],
    ),
  });
}

export function showApiSuccessToast(
  response: unknown,
  fallback = "Islem basariyla tamamlandi.",
) {
  toast.success(getReadableApiSuccessMessage(response, fallback));
}
