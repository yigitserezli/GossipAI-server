import { env } from "../../config/env";
import { AppError } from "../errors/app-error";
import type { AuthContextUser } from "../types/auth";

const ADMIN_PASSCODE_USER_ID = "admin-passcode";

const parseDeveloperEmails = () =>
  (env.DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

export const createAdminPasscodeUser = (): AuthContextUser => ({
  id: ADMIN_PASSCODE_USER_ID,
  email: "admin-passcode@gossipai.local",
  tokenVersion: 0,
});

export const isAdminPasscodeUser = (user: AuthContextUser) => user.id === ADMIN_PASSCODE_USER_ID;

export const assertAdminAccess = (user: AuthContextUser) => {
  if (isAdminPasscodeUser(user)) {
    return;
  }

  const developerEmails = parseDeveloperEmails();
  if (developerEmails.length === 0 || !developerEmails.includes(user.email.toLowerCase())) {
    throw new AppError("Admin access required.", 403, undefined, "FORBIDDEN");
  }
};
