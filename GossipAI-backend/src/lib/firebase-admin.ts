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

export const sendPushToToken = async (payload: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  if (!hasFirebaseConfig || !initialized) {
    throw new Error("Firebase is not configured.");
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
