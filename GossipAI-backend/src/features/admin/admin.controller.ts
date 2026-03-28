import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { adminService } from "./admin.service";

export const listAdminUsers: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const users = await adminService.listUsers(req.user);
  res.status(200).json({ data: users });
};

export const listAdminDevices: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const devices = await adminService.listDevices(req.user);
  res.status(200).json({ data: devices });
};
