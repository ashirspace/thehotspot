import { useMemo, useState } from "react";
import type { Workspace } from "../types";
import { AuthContext, type AuthState } from "./auth-context";

const defaultWorkspace: Workspace = {
  id: "workspace-demo",
  name: "Acme Growth",
  plan: "growth",
  role: "owner",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>({
    id: "demo-user",
    email: "founder@acme.co",
    name: "Ashir Aryan",
  });

  const value = useMemo<AuthState>(
    () => ({
      user,
      workspace: defaultWorkspace,
      signOut: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
