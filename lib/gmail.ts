export async function sendGmail(accessToken: string, to: string, subject: string, body: string) {
  const message = [`To: ${to}`, `Subject: ${subject}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
  const raw = Buffer.from(message).toString("base64url");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!response.ok) throw new Error(`Gmail send failed (${response.status})`);
  return response.json() as Promise<{ id: string; threadId: string }>;
}
