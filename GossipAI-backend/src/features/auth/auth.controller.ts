import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { extractSessionContext } from "./session-context";
import { authService } from "./auth.service";

export const register: RequestHandler = async (req, res) => {
    const result = await authService.register(req.body, extractSessionContext(req));
    res.status(201).json(result);
};

export const login: RequestHandler = async (req, res) => {
    const result = await authService.login(req.body, extractSessionContext(req));
    res.status(200).json(result);
};

export const refresh: RequestHandler = async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken, extractSessionContext(req));
    res.status(200).json(result);
};

export const logout: RequestHandler = async (req, res) => {
    await authService.logout(req.body);
    res.status(204).send();
};

export const me: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const user = await authService.getMe(req.user);
  res.status(200).json({ user });
};

export const updateLanguage: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const user = await authService.updatePreferredLanguage(req.user, req.body.language);
  res.status(200).json({ user });
};

export const verifyAdminPasscode: RequestHandler = async (req, res) => {
  const sessionContext = extractSessionContext(req);
  await authService.verifyAdminPasscode(req.user ?? null, req.body, {
    ipAddress: sessionContext.ipAddress,
  });
  res.status(200).json({ valid: true });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always 200 to prevent email enumeration
  res.status(200).json({ message: "If this email is registered, a reset link has been sent." });
};

export const resetPassword: RequestHandler = async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: "Password updated successfully." });
};
