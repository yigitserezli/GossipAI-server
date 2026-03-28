import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { gossipService } from "./gossip.service";

export const listGossips: RequestHandler = async (_req, res) => {
  res.status(200).json({ data: await gossipService.list() });
};

export const createGossip: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const gossip = await gossipService.create(req.body, req.user);

  res.status(201).json({
    message: "Gossip created",
    data: gossip
  });
};
