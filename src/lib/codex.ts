type GenerateInput = {
  recipientName: string;
  role?: string | null;
  company?: string | null;
  profileSummary?: string | null;
  campaignDescription: string;
  baseMessage: string;
  context: string;
};

export async function generateDirectMessage(input: GenerateInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return [
      `Hi ${input.recipientName},`,
      "",
      `I noticed your work${input.role ? ` as ${input.role}` : ""}${input.company ? ` at ${input.company}` : ""} and thought this would be relevant.`,
      input.baseMessage,
      "",
      "Would it make sense to compare notes this week?",
    ].join("\n");
  }

  const prompt = [
    "You are Codex helping write a concise LinkedIn DM for B2B outreach.",
    "Write one message only. Keep it under 90 words. Avoid hype, fake familiarity, emojis, and spam language.",
    "Personalize using the recipient data and campaign context. Do not invent facts.",
    "",
    `Recipient: ${input.recipientName}`,
    `Role: ${input.role || "Unknown"}`,
    `Company: ${input.company || "Unknown"}`,
    `Profile notes: ${input.profileSummary || "None"}`,
    `Campaign description: ${input.campaignDescription}`,
    `Reference context: ${input.context || "None"}`,
    `Base message: ${input.baseMessage}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      input: prompt,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Codex DM generation failed");
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  return (
    data.output_text ||
    data.output?.flatMap((item) => item.content || []).map((part) => part.text).filter(Boolean).join("\n") ||
    ""
  ).trim();
}
