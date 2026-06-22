import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getViewer } from "@/lib/viewer";

const schema = z.object({ first_name: z.string().trim().min(1), last_name: z.string().trim(), email: z.email(), company: z.string().trim().min(1), job_title: z.string().trim(), notes: z.string().trim(), status: z.enum(["new", "contacted", "follow_up", "replied", "qualified", "not_interested"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead." }, { status: 400 });
  if (viewer.id === "demo-user") return NextResponse.json({ ok: true, demo: true });
  const { id } = await params;
  const sql = getSql();
  const lead = parsed.data;
  await sql`UPDATE contacts SET first_name=${lead.first_name}, last_name=${lead.last_name}, email=${lead.email.toLowerCase()}, company=${lead.company}, job_title=${lead.job_title}, notes=${lead.notes}, status=${lead.status}, updated_at=NOW() WHERE id=${id} AND user_id=${viewer.id}`;
  return NextResponse.json({ ok: true });
}
