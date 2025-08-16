// Minimal API client for the backend
// Uses NEXT_PUBLIC_API_BASE_URL when provided, otherwise defaults to localhost:8000

export type JsonMap = Record<string, unknown>;

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  // Try JSON, fallback to text
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export const api = {
  get: <T = unknown>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...init }),
  post: <T = unknown>(path: string, body?: JsonMap, init?: RequestInit) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...init }),
  ping: () => request<{ status: string }>("/ping", { method: "GET" }),
};

export type Api = typeof api;
