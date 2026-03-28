import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { notificationsService } from "./notifications.service";
import { listCampaignDeliveriesQuerySchema, listCampaignsQuerySchema } from "./notifications.schema";

const requireCampaignId = (value: string | string[] | undefined): string => {
  const campaignId = Array.isArray(value) ? value[0] : value;

  if (!campaignId) {
    throw new AppError("Campaign id is required.", 400, undefined, "VALIDATION_ERROR");
  }

  return campaignId;
};

const requireDeliveryId = (value: string | string[] | undefined): string => {
  const deliveryId = Array.isArray(value) ? value[0] : value;

  if (!deliveryId) {
    throw new AppError("Delivery id is required.", 400, undefined, "VALIDATION_ERROR");
  }

  return deliveryId;
};

export const registerPushDevice: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const device = await notificationsService.registerDevice(req.user, req.body);
  res.status(200).json({ data: device });
};

export const pingActivity: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const result = await notificationsService.pingActivity(req.user, req.body);
  res.status(200).json({ data: result });
};

export const createCampaign: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const campaign = await notificationsService.createCampaign(req.user, req.body);
  res.status(201).json({ data: campaign });
};

export const listCampaigns: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const parsed = listCampaignsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError("Request validation failed.", 400, parsed.error.flatten(), "VALIDATION_ERROR");
  }

  const campaigns = await notificationsService.listCampaigns(req.user, parsed.data);

  res.status(200).json({ data: campaigns });
};

export const getCampaignStats: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const campaignId = requireCampaignId(req.params.id);
  const result = await notificationsService.getCampaignStats(req.user, campaignId);
  res.status(200).json({ data: result });
};

export const listCampaignDeliveries: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const parsed = listCampaignDeliveriesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError("Request validation failed.", 400, parsed.error.flatten(), "VALIDATION_ERROR");
  }

  const campaignId = requireCampaignId(req.params.id);
  const deliveries = await notificationsService.listCampaignDeliveries(req.user, campaignId, parsed.data);
  res.status(200).json({ data: deliveries });
};

export const cancelCampaign: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const campaignId = requireCampaignId(req.params.id);
  const result = await notificationsService.cancelCampaign(req.user, campaignId);
  res.status(200).json({ data: result });
};

export const retryDelivery: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const campaignId = requireCampaignId(req.params.id);
  const deliveryId = requireDeliveryId(req.params.deliveryId);
  const result = await notificationsService.retryDelivery(req.user, campaignId, deliveryId);
  res.status(200).json({ data: result });
};

export const dispatchCampaign: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const campaignId = requireCampaignId(req.params.id);
  const result = await notificationsService.dispatchCampaign(req.user, campaignId);
  res.status(200).json({ data: result });
};

export const runAutomationTick: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED");
  }

  const result = await notificationsService.runAutomationTickAsAdmin(req.user);
  res.status(200).json({ data: result });
};
