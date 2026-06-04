import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const workspaceHeaderSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
});

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>) {
  const body = await request.json().catch(() => null);
  return schema.parse(body);
}

export function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireWorkspace(request: Request) {
  const workspaceId = request.headers.get("x-workspace-id");
  const userId = request.headers.get("x-user-id");
  const parsed = workspaceHeaderSchema.parse({ workspaceId, userId });
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("members")
    .select("role")
    .eq("workspace_id", parsed.workspaceId)
    .eq("user_id", parsed.userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return { error: json({ error: "Workspace membership required" }, { status: 403 }) };
  }

  return { workspaceId: parsed.workspaceId, userId: parsed.userId, role: data.role as string, supabase };
}

export async function checkSuppression(workspaceId: string, email: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("suppression_list")
    .select("reason")
    .eq("workspace_id", workspaceId)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}
