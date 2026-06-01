import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const updateMessageSchema = z.object({
  id: z.string(),
  body: z.string().optional(),
  status: z.enum(["DRAFT", "APPROVED", "SENT", "SKIPPED"]).optional(),
});

export async function GET() {
  const { userId, response } = await requireUser();
  if (response) return response;

  const prisma = getPrisma();
  const messages = await prisma.directMessage.findMany({
    where: { ownerId: userId! },
    include: {
      recipient: true,
      campaign: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
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
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const body = updateMessageSchema.parse(await request.json());
  const prisma = getPrisma();

  const existing = await prisma.directMessage.findFirst({
    where: { id: body.id, ownerId: userId! },
  });

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const updated = await prisma.directMessage.update({
    where: { id: body.id },
    data: {
      body: body.body,
      status: body.status,
      approvedAt: body.status === "APPROVED" ? new Date() : undefined,
      sentAt: body.status === "SENT" ? new Date() : undefined,
    },
  });

  if (body.status) {
    await prisma.activityEvent.create({
      data: {
        messageId: updated.id,
        campaignId: updated.campaignId,
        type: body.status === "APPROVED" ? "APPROVED" : body.status === "SENT" ? "SENT" : body.status === "SKIPPED" ? "SKIPPED" : "DRAFT_CREATED",
      },
    });
  }

  return NextResponse.json({ message: updated });
}
