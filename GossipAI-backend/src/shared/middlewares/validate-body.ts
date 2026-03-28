import type { RequestHandler } from "express";
import { type ZodTypeAny } from "zod";
import { AppError } from "../errors/app-error";

export const validateBody = (schema: ZodTypeAny): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          "Request validation failed.",
          400,
          result.error.flatten(),
          "VALIDATION_ERROR",
          true
        )
      );
    }

    req.body = result.data;
    return next();
  };
};
