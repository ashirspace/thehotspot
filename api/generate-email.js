export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext, senderName, maxChars } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = senderName || "Ashir";
  const charLimit = Math.min(Math.max(parseInt(maxChars) || 400, 100), 1200);

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
1. Body must be UNDER ${charLimit} CHARACTERS total (count every character including spaces and line breaks)
2. ${charLimit <= 250 ? "Ultra-short: 1-2 sentences max before the ask. Every word must earn its place." : charLimit <= 450 ? "Concise: get to the point fast, no fluff." : charLimit <= 700 ? "Medium length: can include more context about the offer, 2-3 short paragraphs." : "Detailed: give full context — who thehotspot is, what the offer includes, why it fits them, success examples if relevant, clear CTA."}
3. Open with the value immediately — no pleasantries, no "I hope this email finds you well"
4. Include the specific benefit — commission %, payout terms, traffic volume, whatever is most compelling from the offer details
5. End with a single clear ask — "Open to a quick call?" or "Want the details?" or similar
6. Sign off: "Best,\n${sender}\nthehotspot" — no other contact info
7. Tone: direct, confident, human — like a message from a real person, not a marketing department
8. NO filler words: not "hope", not "reach out", not "touch base", not "synergy", not "excited", not "innovative"
9. Subject line: under 50 characters, specific, makes them curious — NOT "Partnership Opportunity"

${charLimit <= 250 ? `GOOD example for ultra-short (${charLimit} chars):\n"Hi Acme,\n\nWe send high-intent CPS leads your way — 35% commission, weekly payouts.\n\nWorth 10 mins?\n\nBest,\n${sender}\nthehotspot"` : charLimit >= 700 ? `GOOD example for detailed (${charLimit} chars):\nOpen with their niche, explain thehotspot's network size/quality, lay out the full offer details, mention why this fits them specifically, then a clear CTA.` : `GOOD example:\n"Hi Acme,\n\nWe place high-intent leads with CPS networks — your offers match exactly what our publishers want.\n\n35% commission, weekly payouts. No minimums.\n\nWorth 10 mins this week?\n\nBest,\n${sender}\nthehotspot"`}

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

    // Enforce char limit server-side — trim if model ignored the rule
    let body = parsed.body || fallback.body;
    const hardLimit = charLimit + 60; // small buffer for signature
    if (body.length > hardLimit) {
      const cut = body.lastIndexOf("\n", charLimit);
      body = cut > charLimit * 0.5 ? body.slice(0, cut) + `\n\nBest,\n${sender}\nthehotspot` : body.slice(0, charLimit);
    }

    res.status(200).json({
      subject: parsed.subject || fallback.subject,
      body,
    });
  } catch {
    res.status(200).json(fallback);
  }
}
