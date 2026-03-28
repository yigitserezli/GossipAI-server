import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { env } from "../config/env";

const hasFirebaseConfig =
  Boolean(env.FIREBASE_PROJECT_ID) &&
  Boolean(env.FIREBASE_CLIENT_EMAIL) &&
  Boolean(env.FIREBASE_PRIVATE_KEY);

let initialized = false;

if (hasFirebaseConfig && getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  initialized = true;
}

export const isFirebaseConfigured = hasFirebaseConfig;

const isExpoPushToken = (token: string) =>
  token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[");

const sendExpoPush = async (payload: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(env.EXPO_PUSH_ACCESS_TOKEN
        ? { Authorization: `Bearer ${env.EXPO_PUSH_ACCESS_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      to: payload.token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: "default",
      priority: "high",
    }),
  });

  const json = (await response.json()) as {
    data?: { status?: string; message?: string; details?: unknown };
    errors?: Array<{ message?: string; details?: unknown }>;
  };

  if (!response.ok) {
    const message = json?.errors?.[0]?.message || "Expo push request failed";
    throw new Error(message);
  }

  if (json?.data?.status && json.data.status !== "ok") {
    throw new Error(json?.data?.message || "Expo push rejected by service");
  }

  return json;
};

export const sendFirebasePush = async (payload: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  if (!hasFirebaseConfig || !initialized) {
    throw new Error("Firebase push is not configured.");
  }

  return getMessaging().send({
    token: payload.token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
    android: {
      priority: "high",
    },
  });
};

export const sendPushToToken = async (payload: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  if (isExpoPushToken(payload.token)) {
    return sendExpoPush(payload);
  }

  if (!hasFirebaseConfig || !initialized) {
    throw new Error("Firebase push is not configured for non-Expo tokens.");
  }

  return sendFirebasePush(payload);
};
