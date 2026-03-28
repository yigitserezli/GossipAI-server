import type { RequestHandler } from "express";
import { env } from "../../config/env";
import { authenticate } from "../../shared/middlewares/authenticate";

const parseDeveloperEmails = () =>
  (env.DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const resolveAdminEmail = () => {
  const emails = parseDeveloperEmails();
  return emails[0] ?? "admin@gossipai.local";
};

export const authenticateOrAdminPasscode: RequestHandler = (req, res, next) => {
  const rawPasscode = req.header("x-admin-passcode")?.trim();

  if (rawPasscode && rawPasscode === env.ADMIN_PASSCODE) {
    req.user = {
      id: "admin-passcode",
      email: resolveAdminEmail(),
      tokenVersion: 0,
    };
    return next();
  }

  return authenticate(req, res, next);
};
