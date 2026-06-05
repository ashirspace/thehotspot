import { resolveTxt } from "node:dns/promises";
import { db, handle, json, methodNotAllowed, requireWorkspace } from "../../_shared";

function idFromRequest(request: Request) {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts.at(-2);
}

async function hasTxtRecord(domain: string, predicate: (record: string) => boolean) {
  try {
    const records = await resolveTxt(domain);
    return records.map((parts) => parts.join("")).some(predicate);
  } catch {
    return false;
  }
}

async function hasDkimRecord(domain: string) {
  const selectors = ["google", "default", "selector1", "selector2", "mail"];
  for (const selector of selectors) {
    const ok = await hasTxtRecord(`${selector}._domainkey.${domain}`, (record) => /v=DKIM1|p=/i.test(record));
    if (ok) return true;
  }
  return false;
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Identity id required" }, { status: 400 });

  const [identity] = await db()`
    select *
    from sending_identities
    where id = ${id}
      and workspace_id = ${context.workspaceId}
    limit 1
  `;
  if (!identity) return json({ error: "Sending identity not found" }, { status: 404 });

  const domain = String(identity.tracking_domain || String(identity.from_email).split("@")[1] || "").toLowerCase();
  const dnsSpf = await hasTxtRecord(domain, (record) => /^v=spf1/i.test(record));
  const dnsDkim = await hasDkimRecord(domain);
  const dnsDmarc = await hasTxtRecord(`_dmarc.${domain}`, (record) => /^v=DMARC1/i.test(record));
  const dnsVerified = dnsSpf && dnsDkim && dnsDmarc;

  const [updated] = await db()`
    update sending_identities
    set
      dns_spf = ${dnsSpf},
      dns_dkim = ${dnsDkim},
      dns_dmarc = ${dnsDmarc},
      dns_verified = ${dnsVerified}
    where id = ${id}
      and workspace_id = ${context.workspaceId}
    returning *
  `;

  return json({ identity: updated, dns: { spf: dnsSpf, dkim: dnsDkim, dmarc: dnsDmarc, verified: dnsVerified } });
});
