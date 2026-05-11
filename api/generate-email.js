export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext, senderName } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = senderName || "Ashir";

  const fallback = {
    subject: `Quick opportunity for ${company}`,
    body: `Hi ${company},\n\n${offerContext ? offerContext + "\n\n" : "We run a high-performing affiliate network and think there's a strong fit with what you do.\n\n"}Open to a quick 10-min call this week?\n\nBest,\n${sender}\nthehotspot`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `Write a cold outreach email from ${sender} at thehotspot (affiliate marketing network) to ${company}.

CONTEXT:
- Their website/domain: ${website || "unknown"}
- Partnership type: ${category || "affiliate"}
${offerContext ? `- Key offer details: ${offerContext}` : ""}

RULES — follow every one exactly:
1. Body must be UNDER 400 CHARACTERS total (count every character including spaces and line breaks)
2. Do NOT waste characters on pleasantries — open with the value immediately
3. First line: one short sentence about what thehotspot offers and why it fits ${company}
4. Second line: the specific benefit — commission %, payout terms, traffic volume, or whatever is most compelling from the offer details
5. Third line: single clear ask — "Open to a quick call?" or "Want the details?" or similar
6. Sign off: "Best,\n${sender}\nthehotspot" — no other contact info
7. Tone: direct, confident, human — like a message from a real person, not a marketing email
8. NO filler words: not "hope", not "reach out", not "touch base", not "synergy", not "excited"
9. Subject line: under 45 characters, specific, makes them curious — NOT "Partnership Opportunity"

BAD example (too long, cliché):
"Hi Team, I hope this message finds you well. I wanted to reach out about a potential partnership opportunity that could benefit both our organizations..."

GOOD example (tight, direct):
"Hi Acme,\n\nWe place high-intent leads with CPS networks — your offers match exactly what our publishers want.\n\n35% commission, weekly payouts. Worth 10 mins?\n\nBest,\nAshir\nthehotspot"

Return ONLY valid JSON (no markdown, no extra text):
{"subject": "...", "body": "..."}

Body uses \\n for line breaks. No HTML. No placeholder brackets.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    // Enforce 400 char limit on body — trim if model ignored the rule
    let body = parsed.body || fallback.body;
    if (body.length > 420) {
      // Find last sentence end before 400 chars and cut there
      const cut = body.lastIndexOf("\n", 400);
      body = cut > 200 ? body.slice(0, cut) + `\n\nBest,\n${sender}\nthehotspot` : body.slice(0, 400);
    }

    res.status(200).json({
      subject: parsed.subject || fallback.subject,
      body,
    });
  } catch {
    res.status(200).json(fallback);
  }
}
