import { NextResponse } from "next/server";
import { getContact } from "@/lib/data";
import { generateEmail } from "@/lib/openai";
import { getViewer } from "@/lib/viewer";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const contact = await getContact(viewer.id, id);
  if (!contact) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  try { return NextResponse.json(await generateEmail(contact)); }
  catch { return NextResponse.json({ error: "Could not generate an email. Check the OpenAI configuration." }, { status: 500 }); }
}
