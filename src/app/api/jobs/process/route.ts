import { NextResponse } from "next/server";
import { purgeCloudflareCache } from "@/lib/cloudflare";
import { getRedis } from "@/lib/redis";

export async function GET() {
  const redis = getRedis();

  if (!redis) {
    return NextResponse.json({ processed: 0, configured: false });
  }

  const job = await redis.rpop<Record<string, unknown>>("jobs:campaigns");

  if (!job) {
    return NextResponse.json({ processed: 0, configured: true });
  }

  await purgeCloudflareCache({ tags: ["campaigns", "messages"] }).catch(() => ({
    configured: false,
    purged: false,
  }));

  return NextResponse.json({ processed: 1, job });
}
