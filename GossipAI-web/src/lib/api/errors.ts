import { ZodError } from "zod";

export class ApiValidationError extends Error {
  constructor(
    public readonly validationError: ZodError,
    public readonly payload: unknown,
  ) {
    super("API response validation failed");
    this.name = "ApiValidationError";
  }
}
