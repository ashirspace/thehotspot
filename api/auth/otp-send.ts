import { z } from "zod";
import { db, handle, hashOtp, json, methodNotAllowed, normalizeEmail, readJson, sendTransactionalEmail, verifyTurnstile } from "../_shared";

const schema = z.object({
  email: z.string().email(),
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
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await db()`
    insert into otp_tokens (email, token_hash, expires_at, used_at)
    values (${email}, ${tokenHash}, ${expiresAt}, null)
    on conflict (email) do update set
      token_hash = excluded.token_hash,
      expires_at = excluded.expires_at,
      used_at    = null,
      created_at = now()
  `;

  await sendTransactionalEmail({
    to: email,
    subject: "Your thehotspot sign-in code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p style="margin:0 0 16px;color:#374151">Your one-time sign-in code is:</p>
        <div style="font-size:2.25rem;letter-spacing:0.3em;font-family:monospace;font-weight:700;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 24px;display:inline-block">${otp}</div>
        <p style="margin:16px 0 0;font-size:0.875rem;color:#6b7280">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });

  return json({ ok: true });
});
