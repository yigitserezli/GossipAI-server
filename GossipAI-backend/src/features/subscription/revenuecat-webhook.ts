/**
 * RevenueCat Webhook Handler
 *
 * Docs: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 *
 * Events handled:
 *  - INITIAL_PURCHASE  → activate premium
 *  - RENEWAL           → extend / re-activate premium
 *  - UNCANCELLATION    → user re-subscribed before period end
 *  - PRODUCT_CHANGE    → subscription changed (treat as renewal)
 *  - CANCELLATION      → user cancelled; keep access until expiration_at_ms
 *  - EXPIRATION        → access period ended → downgrade to basic
 *  - BILLING_ISSUE     → payment failed; keep premium but log
 */

import type { Request, Response } from "express";
import { env } from "../../config/env";
import { subscriptionService } from "./subscription.service";

// ─── Types ───────────────────────────────────────────────────────────────────

type RevenueCatEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "EXPIRATION"
  | "BILLING_ISSUE"
  | "PRODUCT_CHANGE"
  | "SUBSCRIBER_ALIAS"
  | "NON_RENEWING_PURCHASE"
  | "TEST";

interface RevenueCatEvent {
  type: RevenueCatEventType;
  app_user_id: string;
  original_app_user_id?: string;
  expiration_at_ms?: number | null;
  environment?: string;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseExpiresAt(expirationMs?: number | null): Date | undefined {
  if (!expirationMs || !Number.isFinite(expirationMs) || expirationMs <= 0) {
    return undefined;
  }
  return new Date(expirationMs);
}

function resolveUserId(event: RevenueCatEvent): string | null {
  // RevenueCat may send the original_app_user_id when aliases are involved.
  // We always use app_user_id first since we set it to our internal userId.
  const id = (event.app_user_id ?? event.original_app_user_id ?? "").trim();
  return id.length > 0 ? id : null;
}

// ─── Webhook handler ─────────────────────────────────────────────────────────

export async function handleRevenueCatWebhook(req: Request, res: Response): Promise<void> {
  // 1. Verify authorization header
  const webhookSecret = env.REVENUECAT_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers["authorization"] ?? "";
    if (authHeader !== webhookSecret) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  // 2. Parse payload
  const payload = req.body as RevenueCatWebhookPayload;
  const event = payload?.event;

  if (!event?.type || !event?.app_user_id) {
    // Malformed payload – respond 200 to prevent RC from retrying
    res.status(200).json({ received: true });
    return;
  }

  // Skip sandbox events in production to avoid polluting real data
  if (event.environment === "SANDBOX" && process.env.NODE_ENV === "production") {
    res.status(200).json({ received: true, skipped: "sandbox" });
    return;
  }

  const userId = resolveUserId(event);
  if (!userId) {
    res.status(200).json({ received: true });
    return;
  }

  try {
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
      case "NON_RENEWING_PURCHASE": {
        const expiresAt = parseExpiresAt(event.expiration_at_ms);
        await subscriptionService.activatePremium(userId, expiresAt);
        break;
      }

      case "PRODUCT_CHANGE": {
        // Subscription product was changed; treat like a renewal.
        const expiresAt = parseExpiresAt(event.expiration_at_ms);
        await subscriptionService.activatePremium(userId, expiresAt);
        break;
      }

      case "CANCELLATION": {
        // User cancelled but still has access until the current period ends.
        // We only update the expiry date so the cron / real EXPIRATION event
        // takes care of the actual downgrade.
        const expiresAt = parseExpiresAt(event.expiration_at_ms);
        if (expiresAt) {
          // Keep them as premium but ensure expiry is set correctly
          await subscriptionService.activatePremium(userId, expiresAt);
        }
        break;
      }

      case "EXPIRATION": {
        await subscriptionService.deactivatePremium(userId);
        break;
      }

      case "BILLING_ISSUE":
      case "SUBSCRIBER_ALIAS":
      case "TEST":
      default:
        // Nothing to do; acknowledge receipt.
        break;
    }
  } catch (err) {
    // Log the error but still return 200 to avoid RC retrying with bad data.
    console.error("[RevenueCat Webhook] Error processing event", {
      type: event.type,
      userId,
      error: (err as Error).message,
    });
  }

  res.status(200).json({ received: true });
}
