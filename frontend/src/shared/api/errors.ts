/** Nest default exception JSON shape. */
export type NestErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

const NETWORK_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";
const SERVER_MESSAGE = "Something went wrong on our side. Please try again.";
const UNKNOWN_MESSAGE = "Something went wrong. Please try again.";

/**
 * Normalized API failure for forms and UI.
 * `message` is always a single readable string (never a stack).
 */
export class ApiError extends Error {
  readonly statusCode: number;
  /** Individual Nest validation messages when `message` was an array. */
  readonly messages: string[];
  readonly error?: string;

  constructor(options: {
    statusCode: number;
    message: string;
    messages?: string[];
    error?: string;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.statusCode = options.statusCode;
    this.messages = options.messages ?? [options.message];
    this.error = options.error;
  }
}

function normalizeMessages(
  message: string | string[] | undefined,
): string[] {
  if (message == null) return [];
  if (Array.isArray(message)) {
    return message.map(String).filter((m) => m.trim() !== "");
  }
  const trimmed = String(message).trim();
  return trimmed === "" ? [] : [trimmed];
}

function isNestErrorBody(value: unknown): value is NestErrorBody {
  return typeof value === "object" && value !== null;
}

/**
 * Map Nest (or opaque) response body + HTTP status into `ApiError`.
 * Never throws while parsing; empty / non-JSON callers should pass `null`.
 */
export function parseApiError(
  statusCode: number,
  body: unknown,
): ApiError {
  const nest = isNestErrorBody(body) ? body : null;
  const status = nest?.statusCode ?? statusCode;
  const messages = normalizeMessages(nest?.message);
  const error = typeof nest?.error === "string" ? nest.error : undefined;

  if (status >= 500) {
    const message =
      messages.length > 0 ? messages.join("; ") : SERVER_MESSAGE;
    return new ApiError({
      statusCode: status,
      message,
      messages: messages.length > 0 ? messages : [SERVER_MESSAGE],
      error,
    });
  }

  if (messages.length > 0) {
    return new ApiError({
      statusCode: status,
      message: messages.join("; "),
      messages,
      error,
    });
  }

  return new ApiError({
    statusCode: status,
    message: UNKNOWN_MESSAGE,
    messages: [UNKNOWN_MESSAGE],
    error,
  });
}

/** Fetch rejected (offline / CORS / DNS) — no stack exposure. */
export function networkApiError(cause?: unknown): ApiError {
  void cause;
  return new ApiError({
    statusCode: 0,
    message: NETWORK_MESSAGE,
    messages: [NETWORK_MESSAGE],
  });
}
