import { z } from "zod";
import { getAdminClient, json, readJson } from "./_shared";

const schema = z.object({
  messageId: z.string().uuid(),
  type: z.enum(["open", "click", "reply", "bounce", "unsubscribe"]),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SIGNING_SECRET) return json({ error: "Invalid webhook secret" }, { status: 401 });

  const input = await readJson(request, schema);
  const supabase = getAdminClient();
  const { data: message, error } = await supabase.from("messages").select("*, leads(email)").eq("id", input.messageId).single();
  if (error) throw error;

  await supabase.from("events").insert({ message_id: input.messageId, type: input.type, payload: input.payload });

  if (["reply", "bounce", "unsubscribe"].includes(input.type)) {
    await supabase.from("messages").update({ status: input.type === "reply" ? "replied" : input.type === "bounce" ? "bounced" : "skipped" }).eq("id", input.messageId);
    await supabase.from("messages").update({ status: "skipped" }).eq("lead_id", message.lead_id).eq("status", "queued");
  }

  if (["bounce", "unsubscribe"].includes(input.type)) {
    await supabase.from("suppression_list").upsert({
      workspace_id: message.workspace_id,
      email: message.leads.email,
      reason: input.type === "bounce" ? "bounced" : "unsubscribed",
    });
  }

  return json({ ok: true });
}
