import { Router } from "express";
import { authenticateOrAdminPasscode } from "../notifications/notifications-auth";
import {
  listAdminDevices,
  listAdminSupportTickets,
  listAdminUsers,
  updateSupportTicketStatus,
  updateUserPlan,
} from "./admin.controller";

const adminRouter = Router();

adminRouter.use(authenticateOrAdminPasscode);

adminRouter.get("/users", listAdminUsers);
adminRouter.get("/devices", listAdminDevices);
adminRouter.get("/support-tickets", listAdminSupportTickets);
adminRouter.patch("/users/:id/plan", updateUserPlan);
adminRouter.patch("/support-tickets/:id/status", updateSupportTicketStatus);

export default adminRouter;
