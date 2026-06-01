import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { enqueueJob } from "@/lib/redis";

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  baseMessage: z.string().min(1),
  audienceType: z.enum(["SINGLE_PERSON", "ENTIRE_COMPANY", "CUSTOM_CATEGORY"]),
  targetCompany: z.string().optional(),
  targetRole: z.string().optional(),
  targetProfession: z.string().optional(),
  targetCategory: z.string().optional(),
  context: z.string().min(1),
  referenceUrl: z.string().optional(),
});

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const prisma = getPrisma();
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: userId! },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const input = campaignSchema.parse(await request.json());
  const prisma = getPrisma();

  const campaign = await prisma.campaign.create({
    data: {
      ownerId: userId!,
      name: input.name,
      description: input.description,
      baseMessage: input.baseMessage,
      audienceType: input.audienceType,
      targetCompany: input.targetCompany,
      targetRole: input.targetRole,
      targetProfession: input.targetProfession,
      targetCategory: input.targetCategory,
      contexts: {
        create: {
          title: "Campaign context",
          kind: "brief",
          content: input.context,
          url: input.referenceUrl || null,
        },
      },
    },
  });

  await enqueueJob("jobs:campaigns", {
    type: "generate-drafts",
    campaignId: campaign.id,
    userId: userId!,
  });

  return NextResponse.json(campaign, { status: 201 });
}
