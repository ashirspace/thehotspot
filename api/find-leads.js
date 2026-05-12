export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { industry, geo, count = 10, category = "Network" } = req.body;

  if (!industry) return res.status(400).json({ error: "industry is required" });

  const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const n = Math.min(count || 10, 20);

  const prompt = `Find ${n} real, currently active companies in the "${industry}" space${geo ? ` based in or operating in ${geo}` : ""}.

These should be legitimate businesses that would be good cold outreach targets for an affiliate marketing partnership.

For each company return:
- company: exact company name
- website: domain only (no https://, e.g. "company.com")
- email: best partnership/contact email (guess format like partnerships@domain.com if needed)
- category: "${category}"
- description: one sentence about what they do

Return ONLY a valid JSON array, no explanation, no markdown:
[{"company":"...","website":"...","email":"...","category":"${category}","description":"..."}]`;

  if (PERPLEXITY_KEY) {
    try {
      const r = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${PERPLEXITY_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
        }),
      });
      const d = await r.json();
      const content = d.choices?.[0]?.message?.content || "";
      const match = content.match(/\[[\s\S]*?\]/);
      if (match) {
        const leads = JSON.parse(match[0]);
        return res.status(200).json({ leads, source: "perplexity" });
      }
    } catch { /* fall through */ }
  }

  if (OPENAI_KEY) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a B2B lead researcher. Return JSON with a 'leads' array." },
            { role: "user", content: prompt + '\n\nReturn: {"leads": [{...}]}' },
          ],
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      const parsed = JSON.parse(d.choices?.[0]?.message?.content || "{}");
      return res.status(200).json({ leads: parsed.leads || [], source: "openai" });
    } catch (err) {
      return res.status(500).json({ error: err.message, leads: [] });
    }
  }

  return res.status(200).json({ leads: [], error: "No AI key configured (add PERPLEXITY_API_KEY or OPENAI_API_KEY)" });
}
