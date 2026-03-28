const OPENAI_API_HOST = "api.openai.com";
const DEFAULT_MAX_BODY_CHARS = 8000;

let isInstalled = false;

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const toMaxBodyChars = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_MAX_BODY_CHARS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_BODY_CHARS;
  }

  return Math.trunc(parsed);
};

const isOpenAIRequest = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === OPENAI_API_HOST;
  } catch {
    return false;
  }
};

const truncate = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, Math.max(1, maxChars - 1)).trimEnd()}...`;
};

const prettyIfJson = (value: string): string => {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
};

const serializeBody = (body: unknown): string => {
  if (body === undefined || body === null) {
    return "(empty)";
  }

  if (typeof body === "string") {
    return prettyIfJson(body);
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  if (body instanceof ArrayBuffer) {
    return `[ArrayBuffer ${body.byteLength} bytes]`;
  }

  if (ArrayBuffer.isView(body)) {
    return `[TypedArray ${body.byteLength} bytes]`;
  }

  if (typeof body === "object") {
    return `[${body.constructor?.name ?? "Object"} body]`;
  }

  return String(body);
};

const extractRequestBody = async (input: RequestInfo | URL, init?: RequestInit): Promise<string> => {
  if (init?.body !== undefined) {
    return serializeBody(init.body);
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    try {
      return prettyIfJson(await input.clone().text());
    } catch {
      return "[request body unavailable]";
    }
  }

  return "(empty)";
};

const extractResponseBody = async (response: Response): Promise<string> => {
  try {
    const text = await response.clone().text();
    if (!text) {
      return "(empty)";
    }

    return prettyIfJson(text);
  } catch {
    return "[response body unavailable]";
  }
};

export const installOpenAIHttpLogger = () => {
  if (isInstalled) {
    return;
  }

  if (!parseBoolean(process.env.OPENAI_HTTP_LOG_ENABLED)) {
    return;
  }

  const maxBodyChars = toMaxBodyChars(process.env.OPENAI_HTTP_LOG_MAX_BODY_CHARS);
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (!isOpenAIRequest(url)) {
      return originalFetch(input, init);
    }

    const method =
      (init?.method ??
        (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET"))?.toUpperCase() ?? "GET";

    const requestBody = truncate(await extractRequestBody(input, init), maxBodyChars);
    const startedAt = Date.now();

    try {
      const response = await originalFetch(input, init);
      const durationMs = Date.now() - startedAt;
      const requestId = response.headers.get("x-request-id") ?? "n/a";
      const responseBody = truncate(await extractResponseBody(response), maxBodyChars);
      const logger = response.ok ? console.log : console.error;

      logger(
        [
          "[OPENAI_HTTP]",
          `METHOD: ${method}`,
          `URL: ${url}`,
          `STATUS: ${response.status}`,
          `DURATION_MS: ${durationMs}`,
          `REQUEST_ID: ${requestId}`,
          `PAYLOAD: ${requestBody}`,
          `RESPONSE: ${responseBody}`
        ].join("\n")
      );

      return response;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(
        [
          "[OPENAI_HTTP]",
          `METHOD: ${method}`,
          `URL: ${url}`,
          "STATUS: NETWORK_ERROR",
          `DURATION_MS: ${durationMs}`,
          `PAYLOAD: ${requestBody}`,
          `RESPONSE: ${errorMessage}`
        ].join("\n")
      );

      throw error;
    }
  };

  isInstalled = true;
};
