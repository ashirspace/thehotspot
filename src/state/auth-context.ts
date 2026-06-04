import { createContext } from "react";
import type { Workspace } from "../types";

export type AuthState = {
  user: { id: string; email: string; name: string } | null;
  workspace: Workspace;
  signOut: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);
