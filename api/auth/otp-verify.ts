import { z } from "zod";
import { createSession, db, ensureDefaultWorkspace, handle, hashOtp, json, methodNotAllowed, normalizeEmail, readJson } from "../_shared";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();

  const input = await readJson(request, schema);
  const email = normalizeEmail(input.email);
  const tokenHash = hashOtp(input.otp);

  const [otpRow] = await db()`
    select email from otp_tokens
    where email = ${email}
      and token_hash = ${tokenHash}
      and expires_at > now()
      and used_at is null
    limit 1
  `;
  if (!otpRow) return json({ error: "Invalid or expired code." }, { status: 401 });

  await db()`
    update otp_tokens set used_at = now() where email = ${email}
  `;

  const [user] = await db()`
    insert into users (email, email_verified_at)
    values (${email}, now())
    on conflict (email) do update set
      email_verified_at = coalesce(users.email_verified_at, now())
    returning id, email::text as email, coalesce(full_name, email::text) as name
  `;

  const workspace = await ensureDefaultWorkspace(String(user.id), email, String(user.name));
  const session = await createSession(String(user.id));

  return json({
    token: session.token,
    user: { id: user.id, email: user.email, name: user.name },
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
