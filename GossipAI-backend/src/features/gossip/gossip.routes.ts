import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { createGossip, listGossips } from "./gossip.controller";
import { createGossipSchema } from "./gossip.schema";

const gossipRouter = Router();

gossipRouter.get("/", listGossips);
gossipRouter.post("/", authenticate, validateBody(createGossipSchema), createGossip);

export default gossipRouter;
