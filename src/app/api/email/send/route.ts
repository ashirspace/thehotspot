import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";
import { requireUser } from "@/lib/session";

const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const input = sendSchema.parse(await request.json());
  const resend = getResend();

  if (!resend) {
    return NextResponse.json({ error: "Resend is not configured" }, { status: 503 });
  }

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Outreach <notifications@example.com>",
    to: input.to,
    subject: input.subject,
    text: input.body,
  });

  return NextResponse.json(result);
}
