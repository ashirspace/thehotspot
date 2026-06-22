import OpenAI from "openai";
import { z } from "zod";
import type { Contact } from "@/lib/types";

let client: OpenAI | undefined;
const draftSchema = z.object({ subject: z.string().min(3).max(120), body: z.string().min(20).max(3000) });

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function generateEmail(contact: Contact) {
  if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV === "development") {
    return { subject: `A simpler outreach workflow for ${contact.company}`, body: `Hi ${contact.first_name},\n\nI noticed you’re leading ${contact.job_title.toLowerCase()} at ${contact.company}. TheHotspot helps small teams turn lead context into thoughtful, personal outreach without adding another heavy sales tool.\n\nWould a 15-minute walkthrough next week be useful?\n\nBest,\nAshir` };
  }
  const response = await getOpenAI().responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    input: `Write one concise, human cold email. Use only the supplied facts; never invent achievements or recent events. Return strict JSON with keys subject and body.\n\nLead: ${JSON.stringify({ firstName: contact.first_name, lastName: contact.last_name, company: contact.company, role: contact.job_title, notes: contact.notes })}`,
  });
  const raw = response.output_text.replace(/^```json\s*|\s*```$/g, "");
  return draftSchema.parse(JSON.parse(raw));
}
