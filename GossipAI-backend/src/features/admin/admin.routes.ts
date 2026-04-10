import { Router } from "express";
import { authenticateOrAdminPasscode } from "../notifications/notifications-auth";
import { listAdminDevices, listAdminUsers, updateUserPlan } from "./admin.controller";

const adminRouter = Router();

adminRouter.use(authenticateOrAdminPasscode);

adminRouter.get("/users", listAdminUsers);
adminRouter.get("/devices", listAdminDevices);
adminRouter.patch("/users/:id/plan", updateUserPlan);

export default adminRouter;
