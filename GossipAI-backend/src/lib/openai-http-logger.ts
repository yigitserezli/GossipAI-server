const OPENAI_API_HOST = "api.openai.com";

let isInstalled = false;

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const isOpenAIRequest = (url: string): boolean => {
  try {
    return new URL(url).hostname === OPENAI_API_HOST;
  } catch {
    return false;
  }
};

// This optional logger must never log prompts, images, generated content, or
// response bodies because they can contain personal conversation data.
export const installOpenAIHttpLogger = () => {
  if (isInstalled || !parseBoolean(process.env.OPENAI_HTTP_LOG_ENABLED)) {
    return;
  }

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
    const startedAt = Date.now();

    try {
      const response = await originalFetch(input, init);
      const logger = response.ok ? console.log : console.error;

      logger(
        [
          "[OPENAI_HTTP]",
          `METHOD: ${method}`,
          `URL: ${url}`,
          `STATUS: ${response.status}`,
          `DURATION_MS: ${Date.now() - startedAt}`,
          `REQUEST_ID: ${response.headers.get("x-request-id") ?? "n/a"}`
        ].join("\n")
      );

      return response;
    } catch (error) {
      console.error(
        [
          "[OPENAI_HTTP]",
          `METHOD: ${method}`,
          `URL: ${url}`,
          "STATUS: NETWORK_ERROR",
          `DURATION_MS: ${Date.now() - startedAt}`,
          `ERROR_TYPE: ${error instanceof Error ? error.name : "unknown"}`
        ].join("\n")
      );
      throw error;
    }
  };

  isInstalled = true;
};
