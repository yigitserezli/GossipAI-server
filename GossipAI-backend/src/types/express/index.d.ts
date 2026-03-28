import type { AuthContextUser } from "../../shared/types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthContextUser;
      dailyUsage?: { count: number; limit: number; remaining: number };
    }
  }
}

export {};
