export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext, senderName, maxChars } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = senderName || "Ashir Ayaan";
  const charLimit = Math.min(Math.max(parseInt(maxChars) || 600, 100), 1200);

  // Category-specific angles
  const categoryAngles = {
    Network: {
      angle: "We drive quality traffic through our owned properties (TravelNags, Khoj Coupons, TopVPN) and want to explore your network's offers",
      value: "High-intent traffic, diverse geo coverage (Singapore, UAE, UK, USA, India), experienced media buying team",
    },
    CPS: {
      angle: "We drive sales through content marketing and SEO on our niche properties",
      value: "Conversion-optimized content, organic traffic, established audience trust",
    },
    CPL: {
      angle: "We generate qualified leads through targeted content and paid campaigns",
      value: "High-quality leads, compliance-first approach, multi-geo capability",
    },
    CPA: {
      angle: "We deliver verified actions through our performance marketing channels",
      value: "Fraud-free traffic, real user engagement, transparent reporting",
    },
    Mobile: {
      angle: "We drive app installs and mobile engagement through our digital properties",
      value: "Mobile-first audience, geo-targeted campaigns, measurable results",
    },
  };

  const cat = categoryAngles[category] || categoryAngles["Network"];

  const fallback = {
    subject: `Quick question for ${company}`,
    body: `Hi ${company},\n\n${offerContext || cat.angle}.\n\nWe're Ibra Digitals — an affiliate marketing agency across Singapore, UAE, UK, USA, and India. ${cat.value}.\n\nOpen to a quick chat?\n\nBest,\n${sender}\nIbra Digitals Branding Services LLC`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const lengthGuidance = charLimit <= 250
    ? "Ultra-short: 2-3 lines max before CTA. Every word must earn its place."
    : charLimit <= 500
    ? "Concise: under 150 words. Tight paragraphs, no filler."
    : charLimit <= 750
    ? "Medium: 150-200 words. Can include more context about the offer."
    : "Detailed: 200-250 words max. Full context, specific value proposition, clear CTA.";

  const prompt = `You are a professional outreach copywriter for Ibra Digitals Branding Services LLC — an international affiliate marketing and digital branding agency operating across Singapore, UAE, UK, USA, and India.

Write a cold outreach email to ${company} (website: ${website || "unknown"}) for a ${category || "affiliate"} partnership.

SENDER: ${sender}, Ibra Digitals Branding Services LLC

${offerContext ? `OFFER DETAILS TO INCLUDE: ${offerContext}` : `CATEGORY ANGLE: ${cat.angle}\nVALUE TO HIGHLIGHT: ${cat.value}`}

LENGTH: Body must be UNDER ${charLimit} CHARACTERS. ${lengthGuidance}

EMAIL STRUCTURE (follow exactly):
1. Subject: Under 8 words, specific, curiosity-driving — NOT "Partnership Opportunity" or generic phrases
2. Line 1 (Hook): Reference something specific about ${company} — their domain, niche, or what they do. Shows you did research.
3. Lines 2-3 (Bridge): Connect their work to what Ibra Digitals does. ONE sentence on what Ibra Digitals is.
4. Lines 4-5 (Value): What's in it for THEM — be specific. Use the offer details or category angle above.
5. Line 6 (CTA): One simple, low-friction ask — "Open to a quick chat?" or "Worth a 10-minute call?" or "Interested?"
6. Sign-off: "${sender}\nIbra Digitals Branding Services LLC"

HARD RULES — violating any of these is a failure:
- NEVER start with "I hope this email finds you well", "I wanted to reach out", "I came across"
- NEVER use "Dear Sir/Madam" — use "${company}" or a contact name
- NEVER use these words: synergy, leverage, innovative, revolutionizing, excited, touch base, circle back, game changer, mutual benefit, look forward to connecting
- NEVER use placeholder text like [Your Name], [Company], [insert], etc.
- Subject must be under 8 words
- Exactly ONE CTA — not two
- Sign off as "${sender}" not "The Team" or "[Name]"

Return ONLY valid JSON:
{"subject": "...", "body": "..."}

Body uses \\n for line breaks. No HTML.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: Math.ceil(charLimit / 2) + 200,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    // Enforce char limit server-side
    let body = parsed.body || fallback.body;
    const hardLimit = charLimit + 80;
    if (body.length > hardLimit) {
      const cut = body.lastIndexOf("\n", charLimit);
      body = cut > charLimit * 0.5
        ? body.slice(0, cut) + `\n\nBest,\n${sender}\nIbra Digitals Branding Services LLC`
        : body.slice(0, charLimit);
    }

    res.status(200).json({
      subject: parsed.subject || fallback.subject,
      body,
    });
  } catch {
    res.status(200).json(fallback);
  }
}
