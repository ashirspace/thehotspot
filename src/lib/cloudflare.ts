type PurgeCacheInput = {
  files?: string[];
  tags?: string[];
};

export async function purgeCloudflareCache(input: PurgeCacheInput) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !token) {
    return { configured: false, purged: false };
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.files?.length ? { files: input.files } : { tags: input.tags }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Cloudflare cache purge failed");
  }

  return { configured: true, purged: true };
}
