const defaultCodeByStatus: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
  502: "UPSTREAM_ERROR",
  503: "SERVICE_UNAVAILABLE"
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly exposeDetails: boolean;

  constructor(
    message: string,
    statusCode = 500,
    details?: unknown,
    code?: string,
    exposeDetails = false
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? defaultCodeByStatus[statusCode] ?? "INTERNAL_ERROR";
    this.details = details;
    this.exposeDetails = exposeDetails;
  }
}
