import { Router } from "express";
import { createSupportTicket } from "./support.controller";

const supportRouter = Router();

supportRouter.post("/tickets", createSupportTicket);

export default supportRouter;
