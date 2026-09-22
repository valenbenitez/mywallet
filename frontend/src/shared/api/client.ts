import { getSessionToken } from "@/features/auth/model/session";
import { ApiError, networkApiError, parseApiError } from "./errors";

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  /** JSON-serializable body; sets `Content-Type: application/json` when set. */
  body?: unknown;
  /** When false, never attach Authorization even if a session exists. Default true. */
  auth?: boolean;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (base == null || base.trim() === "") {
    throw new ApiError({
      statusCode: 0,
      message: "API URL is not configured (NEXT_PUBLIC_API_URL).",
    });
  }
  return base.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalized}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === "") return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Thin fetch wrapper: attaches Bearer JWT when a session token exists,
 * and maps Nest / network failures to `ApiError`.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getSessionToken();
    if (token != null) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw networkApiError(cause);
  }

  const payload = await readBody(response);

  if (!response.ok) {
    throw parseApiError(response.status, payload);
  }

  return payload as T;
}
