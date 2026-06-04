import { json, getAdminClient } from "./_shared";

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  const { data: dueMessages, error } = await supabase
    .from("messages")
    .select("*, leads(email, status), campaigns(status, workspace_id)")
    .eq("status", "queued")
    .lte("scheduled_at", now)
    .limit(25);

  if (error) throw error;

  const processed: string[] = [];
  for (const message of dueMessages || []) {
    const blocked =
      message.campaigns?.status !== "active" ||
      ["replied", "booked", "closed", "lost"].includes(message.leads?.status);

    await supabase
      .from("messages")
      .update({ status: blocked ? "skipped" : "sent", sent_at: blocked ? null : now })
      .eq("id", message.id)
      .eq("status", "queued");
    processed.push(message.id);
  }

  return json({ processed: processed.length, ids: processed });
}
