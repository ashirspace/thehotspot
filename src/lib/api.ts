export const SESSION_TOKEN_KEY = "thehotspot.sessionToken";
export const WORKSPACE_ID_KEY = "thehotspot.workspaceId";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  workspaceId?: string;
  body?: unknown;
  token?: string | null;
};

export function getSessionToken() {
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string | null) {
  if (token) window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  else window.localStorage.removeItem(SESSION_TOKEN_KEY);
}

export function getStoredWorkspaceId() {
  return window.localStorage.getItem(WORKSPACE_ID_KEY);
}

export function setStoredWorkspaceId(workspaceId: string | null) {
  if (workspaceId) window.localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
  else window.localStorage.removeItem(WORKSPACE_ID_KEY);
}

export function isBackendConfigured() {
  return true;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token ?? getSessionToken();
  if (!token) throw new ApiError("You must be signed in.", 401, null);

  const response = await fetch(path, {
    method: options.method || (options.body === undefined ? "GET" : "POST"),
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(options.workspaceId ? { "x-workspace-id": options.workspaceId } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Request failed";
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}
