import { z } from "zod";
import { createSession, db, ensureDefaultWorkspace, handle, json, methodNotAllowed, normalizeEmail, readJson, verifyPassword, verifyTurnstile } from "../_shared";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  turnstileToken: z.string().optional(),
});

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();

  const input = await readJson(request, schema);
  if (input.turnstileToken) {
    const ip = request.headers.get("cf-connecting-ip") ?? undefined;
    const ok = await verifyTurnstile(input.turnstileToken, ip);
    if (!ok) return json({ error: "Human verification failed." }, { status: 403 });
  }
  const email = normalizeEmail(input.email);
  const [user] = await db()`
    select id, email::text as email, coalesce(full_name, email::text) as name, password_hash
    from users
    where email = ${email}
    limit 1
  `;

  const isValid = await verifyPassword(input.password, user?.password_hash ? String(user.password_hash) : null);
  if (!user || !isValid) return json({ error: "Invalid email or password." }, { status: 401 });

  const workspace = await ensureDefaultWorkspace(String(user.id), String(user.email), String(user.name));
  const session = await createSession(String(user.id));

  return json({
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    workspace: {
      id: workspace.membership.id,
      name: workspace.membership.name,
      plan: workspace.membership.plan,
      physical_address: workspace.membership.physical_address,
      owner_id: workspace.membership.owner_id,
    },
    role: workspace.membership.role,
  });
});
