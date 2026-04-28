import type { RequestHandler } from "express";
import { authService } from "../auth/auth.service";
import { extractSessionContext } from "../auth/session-context";
import { createAdminPasscodeUser } from "../../shared/auth/admin-access";
import { authenticate } from "../../shared/middlewares/authenticate";

export const authenticateOrAdminPasscode: RequestHandler = async (req, res, next) => {
  const rawPasscode = req.header("x-admin-passcode")?.trim();

  if (rawPasscode) {
    try {
      const sessionContext = extractSessionContext(req);
      await authService.verifyAdminPasscode(
        null,
        { passcode: rawPasscode },
        { ipAddress: sessionContext.ipAddress }
      );
      req.user = createAdminPasscodeUser();
      return next();
    } catch (error) {
      return next(error);
    }
  }

  return authenticate(req, res, next);
};
