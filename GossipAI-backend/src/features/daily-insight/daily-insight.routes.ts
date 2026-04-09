import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { getTodayInsight } from "./daily-insight.controller";

const dailyInsightRouter = Router();

dailyInsightRouter.get("/today", authenticate, getTodayInsight);

export default dailyInsightRouter;
