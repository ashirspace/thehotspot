import { createContext } from "react";
import type { Workspace } from "../types";

export type AuthState = {
  user: { id: string; email: string; name: string } | null;
  workspace: Workspace;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  signUp: (input: { fullName: string; email: string; password: string; turnstileToken?: string }) => Promise<void>;
  sendOtp: (email: string, turnstileToken?: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
