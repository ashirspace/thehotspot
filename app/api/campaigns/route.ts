import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ name: z.string().trim().min(3).max(120) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
  if (viewer.id === "demo-user") return NextResponse.json({ ok: true, demo: true }, { status: 201 });
  const sql = getSql();
  await sql`INSERT INTO campaigns (user_id, name) VALUES (${viewer.id}, ${parsed.data.name})`;
  return NextResponse.json({ ok: true }, { status: 201 });
}
