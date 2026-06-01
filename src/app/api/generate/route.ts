import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateDirectMessage } from "@/lib/codex";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const generateSchema = z.object({
  campaignId: z.string(),
});

export async function POST(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const { campaignId } = generateSchema.parse(await request.json());
  const prisma = getPrisma();

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId! },
    include: { contexts: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      ownerId: userId!,
      ...(campaign.targetCompany
        ? { company: { contains: campaign.targetCompany, mode: "insensitive" } }
        : {}),
      ...(campaign.targetRole
        ? { role: { contains: campaign.targetRole, mode: "insensitive" } }
        : {}),
      ...(campaign.targetProfession
        ? { profession: { contains: campaign.targetProfession, mode: "insensitive" } }
        : {}),
      ...(campaign.targetCategory
        ? { category: { contains: campaign.targetCategory, mode: "insensitive" } }
        : {}),
    },
    take: 25,
    orderBy: { createdAt: "desc" },
  });

  const context = campaign.contexts
    .map((item) => [item.title, item.content, item.url].filter(Boolean).join("\n"))
    .join("\n\n");

  const created = [];

  for (const recipient of recipients) {
    const body = await generateDirectMessage({
      recipientName: recipient.fullName,
      role: recipient.role,
      company: recipient.company,
      profileSummary: recipient.profileSummary,
      campaignDescription: campaign.description,
      baseMessage: campaign.baseMessage,
      context,
    });

    const message = await prisma.directMessage.create({
      data: {
        ownerId: userId!,
        campaignId: campaign.id,
        recipientId: recipient.id,
        body,
        generatedBody: body,
        activities: {
          create: {
            campaignId: campaign.id,
            type: "DRAFT_CREATED",
          },
        },
      },
      include: {
        campaign: true,
        recipient: true,
      },
    });

    created.push({
      id: message.id,
      recipientName: message.recipient?.fullName || "Unknown recipient",
      recipientRole: message.recipient?.role,
      company: message.recipient?.company,
      campaignName: message.campaign?.name,
      body: message.body,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      sentAt: message.sentAt?.toISOString() || null,
      openedAt: message.openedAt?.toISOString() || null,
      respondedAt: message.respondedAt?.toISOString() || null,
    });
  }

  return NextResponse.json({ messages: created });
}
