import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const params = request.nextUrl.searchParams;
  const audienceType = params.get("audienceType");
  const company = params.get("company")?.trim();
  const role = params.get("role")?.trim();
  const profession = params.get("profession")?.trim();
  const category = params.get("category")?.trim();

  const prisma = getPrisma();
  const count = await prisma.recipient.count({
    where: {
      ownerId: userId!,
      ...(audienceType === "ENTIRE_COMPANY" && company
        ? { company: { contains: company, mode: "insensitive" } }
        : {}),
      ...(role ? { role: { contains: role, mode: "insensitive" } } : {}),
      ...(profession ? { profession: { contains: profession, mode: "insensitive" } } : {}),
      ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    },
  });

  return NextResponse.json({ count });
}
