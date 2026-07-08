import type { RequestHandler } from "express";
import { authService } from "../auth/auth.service";
import { createSupportTicketSchema } from "./support.schema";
import { supportService } from "./support.service";

const getOptionalAuthUser = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  try {
    return authService.decodeAccessToken(token);
  } catch {
    return null;
  }
};

export const createSupportTicket: RequestHandler = async (req, res) => {
  const input = createSupportTicketSchema.parse(req.body);
  const user = getOptionalAuthUser(req.headers.authorization);
  const ticket = await supportService.createTicket(input, user);

  res.status(201).json({
    message: "Support ticket created.",
    data: ticket,
  });
};
