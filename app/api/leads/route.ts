import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getViewer } from "@/lib/viewer";

const leadSchema = z.object({ first_name: z.string().trim().min(1), last_name: z.string().trim().default(""), email: z.email(), company: z.string().trim().min(1), job_title: z.string().trim().default(""), notes: z.string().trim().default("") });

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const items = Array.isArray(body) ? body : [body];
  const parsed = z.array(leadSchema).min(1).max(500).safeParse(items);
  if (!parsed.success) return NextResponse.json({ error: "Some lead fields are invalid." }, { status: 400 });
  if (viewer.id === "demo-user") return NextResponse.json({ created: parsed.data.length, demo: true }, { status: 201 });
  const sql = getSql();
  let created = 0;
  for (const lead of parsed.data) {
    const rows = await sql`INSERT INTO contacts (user_id, first_name, last_name, email, company, job_title, notes) VALUES (${viewer.id}, ${lead.first_name}, ${lead.last_name}, ${lead.email.toLowerCase()}, ${lead.company}, ${lead.job_title}, ${lead.notes}) ON CONFLICT (user_id, email) DO NOTHING RETURNING id`;
    created += rows.length;
  }
  return NextResponse.json({ created }, { status: 201 });
}
