import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";

const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.email(), password: z.string().min(8).max(72) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid name, email, and password (8+ characters)." }, { status: 400 });
  try {
    const sql = getSql();
    const passwordHash = await hash(parsed.data.password, 12);
    await sql`INSERT INTO users (name, email, password_hash) VALUES (${parsed.data.name}, ${parsed.data.email.toLowerCase()}, ${passwordHash})`;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (String(error).includes("unique")) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    return NextResponse.json({ error: "Account creation failed." }, { status: 500 });
  }
}
