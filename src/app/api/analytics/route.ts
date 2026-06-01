import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function sinceForRange(range: string | null) {
  const now = Date.now();
  if (range === "hour") return new Date(now - 1000 * 60 * 60);
  if (range === "week") return new Date(now - 1000 * 60 * 60 * 24 * 7);
  return new Date(now - 1000 * 60 * 60 * 24);
}

export async function GET(request: NextRequest) {
  const { userId, response } = await requireUser();
  if (response) return response;

  const range = request.nextUrl.searchParams.get("range");
  const since = sinceForRange(range);
  const prisma = getPrisma();

  const [sentCount, openedCount, respondedCount, events] = await Promise.all([
    prisma.directMessage.count({ where: { ownerId: userId!, status: "SENT", sentAt: { gte: since } } }),
    prisma.directMessage.count({ where: { ownerId: userId!, openedAt: { gte: since } } }),
    prisma.directMessage.count({ where: { ownerId: userId!, respondedAt: { gte: since } } }),
    prisma.activityEvent.findMany({
      where: {
        createdAt: { gte: since },
        OR: [
          { campaign: { ownerId: userId! } },
          { message: { ownerId: userId! } },
        ],
      },
      include: {
        campaign: true,
        message: {
          include: {
            recipient: true,
            campaign: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return NextResponse.json({
    openRate: sentCount ? Math.round((openedCount / sentCount) * 100) : 0,
    responseRate: sentCount ? Math.round((respondedCount / sentCount) * 100) : 0,
    engagementTrend: Math.min(99, Math.max(0, respondedCount * 4 + openedCount)),
    sentCount,
    timeline: events.map((event) => ({
      id: event.id,
      type: event.type,
      label: labelForEvent(event.type, event.message?.recipient?.fullName),
      createdAt: event.createdAt.toISOString(),
      message: event.campaign?.name || event.message?.campaign?.name || undefined,
    })),
  });
}

function labelForEvent(type: string, recipientName?: string | null) {
  if (type === "OPENED") return `${recipientName || "A recipient"} opened a DM`;
  if (type === "RESPONDED") return `${recipientName || "A recipient"} replied`;
  if (type === "APPROVED") return `${recipientName || "A recipient"} was approved`;
  if (type === "SENT") return `${recipientName || "A recipient"} was sent a DM`;
  if (type === "IMPORTED") return "New recipients were imported";
  return "Campaign activity recorded";
}
