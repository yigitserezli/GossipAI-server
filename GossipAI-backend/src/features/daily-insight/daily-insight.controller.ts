import type { RequestHandler } from "express";
import { dailyInsightService } from "./daily-insight.service";

export const getTodayInsight: RequestHandler = async (req, res) => {
  const language = (req.headers["x-language"] as string) || "en";
  const insight = await dailyInsightService.getTodayInsight(language);

  res.status(200).json({ data: insight });
};
