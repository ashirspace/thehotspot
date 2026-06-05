import { useCallback, useEffect, useMemo, useState } from "react";
import type { Workspace } from "../types";
import { SESSION_TOKEN_KEY, apiFetch, getSessionToken, getStoredWorkspaceId, setSessionToken, setStoredWorkspaceId } from "../lib/api";
import { AuthContext, type AuthState } from "./auth-context";

type AuthPayload = {
  token?: string;
  user: { id: string; email: string; name: string };
  workspace: { id: string; name: string; plan: Workspace["plan"] };
  role: Workspace["role"];
};

const emptyWorkspace: Workspace = {
  id: "",
  name: "Workspace",
  plan: "starter",
  role: "member",
};

function toWorkspace(payload: Pick<AuthPayload, "workspace" | "role">): Workspace {
  return {
    id: payload.workspace.id,
    name: payload.workspace.name,
    plan: payload.workspace.plan,
    role: payload.role,
  };
}

async function postAuth(path: string, body?: unknown, token?: string | null) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Authentication request failed";
    throw new Error(message);
  }
  return payload as AuthPayload;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return Boolean(getSessionToken()) || Boolean(urlParams.get("token"));
  });
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);

  const applyAuthPayload = useCallback((payload: AuthPayload) => {
    if (payload.token) setSessionToken(payload.token);
    setStoredWorkspaceId(payload.workspace.id);
    setUser(payload.user);
    setWorkspace(toWorkspace(payload));
  }, []);

  useEffect(() => {
    let mounted = true;

    // Pick up token from Google OAuth redirect: /login?token=...&wid=...
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      setSessionToken(urlToken);
      const wid = urlParams.get("wid");
      if (wid) setStoredWorkspaceId(wid);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const token = getSessionToken();
    const workspaceId = getStoredWorkspaceId();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<AuthPayload>("/api/auth?action=session", { token, workspaceId: workspaceId || undefined })
      .then((payload) => {
        if (mounted) applyAuthPayload(payload);
      })
      .catch(() => {
        if (mounted) {
          window.localStorage.removeItem(SESSION_TOKEN_KEY);
          setStoredWorkspaceId(null);
          setUser(null);
          setWorkspace(emptyWorkspace);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [applyAuthPayload]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      workspace,
      loading,
      error,
      signIn: async (email, password, turnstileToken) => {
        setError(null);
        try {
          const payload = await postAuth("/api/auth?action=login", { email, password, turnstileToken });
          applyAuthPayload(payload);
        } catch (authError) {
          const message = authError instanceof Error ? authError.message : "Authentication failed";
          setError(message);
          throw authError;
        }
      },
      signUp: async ({ fullName, email, password, turnstileToken }) => {
        setError(null);
        try {
          const payload = await postAuth("/api/auth?action=signup", { fullName, email, password, turnstileToken });
          applyAuthPayload(payload);
        } catch (authError) {
          const message = authError instanceof Error ? authError.message : "Authentication failed";
          setError(message);
          throw authError;
        }
      },
      sendOtp: async (email, turnstileToken) => {
        setError(null);
        const res = await fetch("/api/auth?action=otp-send", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), turnstileToken }),
        });
        if (!res.ok) {
          const p = await res.json().catch(() => null);
          const msg = (p && typeof p === "object" && "error" in p && typeof p.error === "string" ? p.error : null) ?? "Failed to send OTP";
          setError(msg);
          throw new Error(msg);
        }
      },
      verifyOtp: async (email, otp) => {
        setError(null);
        try {
          const payload = await postAuth("/api/auth?action=otp-verify", { email: email.trim().toLowerCase(), otp });
          applyAuthPayload(payload);
        } catch (authError) {
          const message = authError instanceof Error ? authError.message : "OTP verification failed";
          setError(message);
          throw authError;
        }
      },
      signOut: async () => {
        const token = getSessionToken();
        if (token) await postAuth("/api/auth?action=logout", undefined, token).catch(() => undefined);
        setSessionToken(null);
        setStoredWorkspaceId(null);
        setUser(null);
        setWorkspace(emptyWorkspace);
      },
    }),
    [applyAuthPayload, error, loading, user, workspace],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
