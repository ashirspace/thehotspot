import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getAuthOptions } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerSession(getAuthOptions());

  if (!session?.user?.id) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    userId: session.user.id,
    response: null,
  };
}
