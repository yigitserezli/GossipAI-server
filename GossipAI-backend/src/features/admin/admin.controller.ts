import type { RequestHandler } from "express";
import { z } from "zod";
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

const updatePlanBodySchema = z.object({
  plan: z.enum(["basic", "premium"]),
});

export const updateUserPlan: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const { plan } = updatePlanBodySchema.parse(req.body);
  const userId = String(req.params.id);

  const user = await adminService.updateUserPlan(req.user, userId, plan);
  res.status(200).json({ data: user });
};
