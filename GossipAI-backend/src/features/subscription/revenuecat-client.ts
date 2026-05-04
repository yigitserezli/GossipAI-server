/**
 * RevenueCat REST API client for server-side subscription verification.
 *
 * Used by the /sync endpoint to verify the customer's active entitlements
 * directly from RevenueCat after an in-app purchase.
 *
 * Docs: https://www.revenuecat.com/docs/api-v1#tag/customers/operation/get-a-customer
 */

import { env } from "../../config/env";

interface RcEntitlement {
  expires_date: string | null;
  product_identifier: string;
  purchase_date: string;
}

interface RcSubscriber {
  entitlements: Record<string, RcEntitlement>;
  subscriptions: Record<
    string,
    {
      expires_date: string | null;
      unsubscribe_detected_at: string | null;
      billing_issues_detected_at: string | null;
    }
  >;
}

interface RcSubscriberResponse {
  subscriber: RcSubscriber;
}

export interface RcPremiumStatus {
  isActive: boolean;
  expiresAt: Date | null;
}

const RC_BASE_URL = "https://api.revenuecat.com/v1";

/**
 * Fetches the subscriber info from RevenueCat and resolves
 * whether the user has an active premium entitlement and its expiry date.
 *
 * Returns null if the RC API key is not configured.
 */
export async function getRevenueCatPremiumStatus(
  appUserId: string,
  premiumEntitlementId: string
): Promise<RcPremiumStatus | null> {
  const apiKey = env.REVENUECAT_API_KEY;
  if (!apiKey) {
    return null;
  }

  const url = `${RC_BASE_URL}/subscribers/${encodeURIComponent(appUserId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`RevenueCat API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as RcSubscriberResponse;
  const subscriber = data?.subscriber;

  if (!subscriber) {
    return { isActive: false, expiresAt: null };
  }

  // Check the named entitlement first, then fall back to any entitlement
  // whose identifier contains "premium".
  const entitlementKeys = Object.keys(subscriber.entitlements ?? {});
  const matchingKey =
    entitlementKeys.find((k) => k === premiumEntitlementId) ??
    entitlementKeys.find((k) => k.toLowerCase().includes("premium"));

  if (!matchingKey) {
    return { isActive: false, expiresAt: null };
  }

  const entitlement = subscriber.entitlements[matchingKey];
  const expiresDateStr = entitlement?.expires_date;

  if (!expiresDateStr) {
    // Non-consumable / lifetime purchase
    return { isActive: true, expiresAt: null };
  }

  const expiresAt = new Date(expiresDateStr);
  const isActive = expiresAt > new Date();

  return { isActive, expiresAt };
}
