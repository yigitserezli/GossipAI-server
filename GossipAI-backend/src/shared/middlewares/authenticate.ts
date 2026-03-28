import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { authService } from "../../features/auth/auth.service";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED"));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return next(new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED"));
  }

  try {
    req.user = authService.decodeAccessToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
};
