import { AiConsentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";

export const AI_CONSENT_POLICY_VERSION = "2026-07-15";

export type AiConsentAction = "grant" | "revoke";

type AiConsentState = {
  status: "granted" | "revoked" | "required";
  requiredPolicyVersion: string;
  acceptedPolicyVersion: string | null;
  grantedAt: string | null;
};

const getLatestEvent = (userId: string) =>
  prisma.aiConsentEvent.findFirst({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }]
  });

const toState = (event: Awaited<ReturnType<typeof getLatestEvent>>): AiConsentState => {
  const isCurrentGrant =
    event?.status === AiConsentStatus.granted &&
    event.policyVersion === AI_CONSENT_POLICY_VERSION;

  return {
    status: isCurrentGrant ? "granted" : event?.status === AiConsentStatus.revoked ? "revoked" : "required",
    requiredPolicyVersion: AI_CONSENT_POLICY_VERSION,
    acceptedPolicyVersion: event?.status === AiConsentStatus.granted ? event.policyVersion : null,
    grantedAt: isCurrentGrant ? event.createdAt.toISOString() : null
  };
};

export const aiConsentService = {
  async getState(userId: string): Promise<AiConsentState> {
    return toState(await getLatestEvent(userId));
  },

  async record(userId: string, action: AiConsentAction, policyVersion: string): Promise<AiConsentState> {
    if (policyVersion !== AI_CONSENT_POLICY_VERSION) {
      throw new AppError(
        "The AI data-processing policy must be accepted again.",
        403,
        { requiredPolicyVersion: AI_CONSENT_POLICY_VERSION },
        "AI_CONSENT_VERSION_OUTDATED",
        true
      );
    }

    const event = await prisma.aiConsentEvent.create({
      data: {
        userId,
        status: action === "grant" ? AiConsentStatus.granted : AiConsentStatus.revoked,
        policyVersion
      }
    });

    return toState(event);
  },

  async requireActive(userId: string): Promise<void> {
    const event = await getLatestEvent(userId);
    const state = toState(event);

    if (state.status === "granted") {
      return;
    }

    const isOutdated =
      event?.status === AiConsentStatus.granted &&
      event.policyVersion !== AI_CONSENT_POLICY_VERSION;

    throw new AppError(
      isOutdated
        ? "The AI data-processing policy must be accepted again."
        : "AI data-processing consent is required.",
      403,
      { requiredPolicyVersion: AI_CONSENT_POLICY_VERSION },
      isOutdated ? "AI_CONSENT_VERSION_OUTDATED" : "AI_CONSENT_REQUIRED",
      true
    );
  }
};
