export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { category, current } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({ angle: "We have a strong track record in your space and think there's a real opportunity to work together — happy to share specifics on a quick call." });
  }

  const angleMap = {
    Partnership: "B2B partnership outreach — natural business fit, mutual audience overlap, or complementary offerings",
    Revenue:     "performance/revenue outreach — driving traffic, leads, or sales to the recipient through owned media properties or a partner network",
    Integration: "SaaS integration outreach — users of one platform want the other, technical collaboration opportunity",
    Agency:      "agency collaboration outreach — paid distribution for creative campaigns, client results, amplifying award-winning work",
    Startup:     "startup growth outreach — distribution partnership, reaching their ICP through content or paid channels",
  };

  const context = angleMap[category] || "B2B outreach partnership";

  const prompt = `Write ONE cold email pitch angle for ${context}.

Rules:
- One sentence only, max 25 words
- Start with a specific value statement or observation, not "I" or "We"
- No clichés: no "synergy", "leverage", "game-changer", "exciting opportunity", "win-win"
- Confident and direct — peer-to-peer tone
- Different from this one: "${current || ""}"

Return ONLY the sentence, no quotes, no explanation.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 80,
        messages: [
          { role: "system", content: "You write sharp, one-sentence B2B cold email pitch angles. No fluff, no clichés. Return only the sentence." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const angle = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") || "";
    return res.status(200).json({ angle });
  } catch {
    return res.status(200).json({ angle: "Our network consistently delivers qualified traffic to partners in your vertical — worth a 10-minute call to see if the numbers make sense." });
  }
}
