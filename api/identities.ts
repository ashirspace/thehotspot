import { resolveTxt } from "node:dns/promises";
import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared.js";

const createSchema = z.object({
  fromName: z.string().trim().min(1).max(120),
  fromEmail: z.string().email(),
  provider: z.enum(["gmail", "resend", "sendgrid"]),
  providerAccountRef: z.string().trim().optional(),
  trackingDomain: z.string().trim().optional(),
  dailyLimit: z.number().int().min(0).max(500).optional(),
});

async function hasTxtRecord(domain: string, predicate: (record: string) => boolean) {
  try {
    const records = await resolveTxt(domain);
    return records.map((parts) => parts.join("")).some(predicate);
  } catch { return false; }
}

async function hasDkimRecord(domain: string) {
  const selectors = ["google", "default", "selector1", "selector2", "mail"];
  for (const selector of selectors) {
    const ok = await hasTxtRecord(`${selector}._domainkey.${domain}`, (r) => /v=DKIM1|p=/i.test(r));
    if (ok) return true;
  }
  return false;
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  // POST /api/identities?id=xxx&action=verify-dns
  if (id && action === "verify-dns") {
    if (request.method !== "POST") return methodNotAllowed();
    const [identity] = await db()`
      select * from sending_identities where id = ${id} and workspace_id = ${context.workspaceId} limit 1
    `;
    if (!identity) return json({ error: "Sending identity not found" }, { status: 404 });
    const domain = String(identity.tracking_domain || String(identity.from_email).split("@")[1] || "").toLowerCase();
    const dnsSpf = await hasTxtRecord(domain, (r) => /^v=spf1/i.test(r));
    const dnsDkim = await hasDkimRecord(domain);
    const dnsDmarc = await hasTxtRecord(`_dmarc.${domain}`, (r) => /^v=DMARC1/i.test(r));
    const dnsVerified = dnsSpf && dnsDkim && dnsDmarc;
    const [updated] = await db()`
      update sending_identities set dns_spf = ${dnsSpf}, dns_dkim = ${dnsDkim}, dns_dmarc = ${dnsDmarc}, dns_verified = ${dnsVerified}
      where id = ${id} and workspace_id = ${context.workspaceId}
      returning *
    `;
    return json({ identity: updated, dns: { spf: dnsSpf, dkim: dnsDkim, dmarc: dnsDmarc, verified: dnsVerified } });
  }

  // GET /api/identities — list
  if (request.method === "GET") {
    const identities = await db()`
      select * from sending_identities where workspace_id = ${context.workspaceId} order by created_at asc
    `;
    return json({ identities });
  }

  // POST /api/identities — create
  if (request.method === "POST") {
    const input = await readJson(request, createSchema);
    const [identity] = await db()`
      insert into sending_identities (workspace_id, from_name, from_email, provider, provider_account_ref, tracking_domain, daily_limit)
      values (${context.workspaceId}, ${input.fromName}, ${input.fromEmail.toLowerCase()}, ${input.provider}::sender_provider, ${input.providerAccountRef || null}, ${input.trackingDomain || null}, ${input.dailyLimit || 20})
      returning *
    `;
    return json({ identity }, { status: 201 });
  }

  return methodNotAllowed();
});
