import { Router } from "express";
import { validateBody } from "../../shared/middlewares/validate-body";
import { authenticateOrAdminPasscode } from "./notifications-auth";
import {
  autoTranslateCampaign,
  cancelCampaign,
  createCampaign,
  dispatchCampaign,
  getCampaignStats,
  listCampaignDeliveries,
  listCampaigns,
  pingActivity,
  registerPushDevice,
  retryDelivery,
  runAutomationTick,
} from "./notifications.controller";
import {
  activityPingSchema,
  autoTranslateSchema,
  createCampaignSchema,
  registerDeviceSchema,
} from "./notifications.schema";

const notificationsRouter = Router();

notificationsRouter.use(authenticateOrAdminPasscode);

notificationsRouter.post("/devices", validateBody(registerDeviceSchema), registerPushDevice);
notificationsRouter.post("/activity/ping", validateBody(activityPingSchema), pingActivity);
notificationsRouter.post("/campaigns/auto-translate", validateBody(autoTranslateSchema), autoTranslateCampaign);
notificationsRouter.post("/campaigns", validateBody(createCampaignSchema), createCampaign);
notificationsRouter.get("/campaigns", listCampaigns);
notificationsRouter.get("/campaigns/:id/stats", getCampaignStats);
notificationsRouter.get("/campaigns/:id/deliveries", listCampaignDeliveries);
notificationsRouter.post("/campaigns/:id/deliveries/:deliveryId/retry", retryDelivery);
notificationsRouter.post("/campaigns/:id/dispatch", dispatchCampaign);
notificationsRouter.post("/campaigns/:id/cancel", cancelCampaign);
notificationsRouter.post("/automation/run", runAutomationTick);

export default notificationsRouter;
