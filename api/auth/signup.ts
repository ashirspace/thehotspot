import { z } from "zod";
import { createSession, db, ensureDefaultWorkspace, handle, hashPassword, json, methodNotAllowed, normalizeEmail, readJson, verifyTurnstile } from "../_shared";

const schema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  workspaceName: z.string().trim().min(1).max(80).optional(),
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
  const passwordHash = await hashPassword(input.password);

  const [user] = await db()`
    insert into users (email, full_name, password_hash)
    values (${email}, ${input.fullName}, ${passwordHash})
    on conflict (email) do nothing
    returning id, email::text as email, coalesce(full_name, email::text) as name
  `;

  if (!user) return json({ error: "An account already exists for this email." }, { status: 409 });

  const workspace = await ensureDefaultWorkspace(String(user.id), email, input.fullName, input.workspaceName);
  const session = await createSession(String(user.id));

  return json(
    {
      token: session.token,
      user,
      workspace: {
        id: workspace.membership.id,
        name: workspace.membership.name,
        plan: workspace.membership.plan,
        physical_address: workspace.membership.physical_address,
        owner_id: workspace.membership.owner_id,
      },
      role: workspace.membership.role,
    },
    { status: 201 },
  );
});
