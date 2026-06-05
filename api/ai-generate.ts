import { z } from "zod";
import { handle, json, readJson, requireWorkspace } from "./_shared.js";

const schema = z.object({
  lead: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    company: z.string(),
    role: z.string().optional(),
    enrichment: z.record(z.string(), z.unknown()).default({}),
  }),
  template: z.object({
    subject: z.string().optional(),
    body: z.string(),
  }),
  toneGuide: z.string().default("Concise, specific, no hype, no invented facts."),
});

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const membership = await requireWorkspace(request);
  if ("error" in membership) return membership.error;

  const input = await readJson(request, schema);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Generate safe B2B outreach copy. Return only JSON with subject, body, confidence. Do not invent facts, links, or fake familiarity.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    }),
  });

  if (!response.ok) return json({ error: await response.text() }, { status: 502 });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const parsed = z
    .object({ subject: z.string().min(1), body: z.string().min(1), confidence: z.number().min(0).max(1) })
    .safeParse(JSON.parse(content));

  if (!parsed.success || parsed.data.confidence < 0.65) {
    return json({ reviewRequired: true, reason: "Low confidence or invalid AI output" }, { status: 422 });
  }

  return json({ reviewRequired: false, generation: parsed.data });
});
