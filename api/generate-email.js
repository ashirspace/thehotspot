export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext, senderName, maxChars } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = senderName || "Ashir Ayaan";
  const charLimit = Math.min(Math.max(parseInt(maxChars) || 600, 100), 1200);

  const categoryAngles = {
    Network: {
      angle: "We drive quality traffic through our owned properties — TravelNags, Khoj Coupons, TopVPN — and want to explore your network's offers.",
      value: "High-intent traffic, geo coverage across Singapore, UAE, UK, USA, India. Experienced media buying team.",
    },
    CPS: {
      angle: "We drive sales through content marketing and SEO on our niche properties.",
      value: "Conversion-optimized content, organic traffic, established audience trust.",
    },
    CPL: {
      angle: "We generate qualified leads through targeted content and paid campaigns.",
      value: "High-quality leads, compliance-first approach, multi-geo capability.",
    },
    CPA: {
      angle: "We deliver verified actions through our performance marketing channels.",
      value: "Fraud-free traffic, real user engagement, transparent reporting.",
    },
    Mobile: {
      angle: "We drive app installs and mobile engagement through our digital properties.",
      value: "Mobile-first audience, geo-targeted campaigns, measurable results.",
    },
  };

  const cat = categoryAngles[category] || categoryAngles["Network"];

  const fallback = {
    subject: `Quick question for ${company}`,
    body: `Hi ${company},\n\n${cat.angle}\n\nIbra Digitals is an affiliate marketing agency across Singapore, UAE, UK, USA, and India. ${cat.value}\n\nOpen to a quick chat?\n\nBest,\n${sender}\nIbra Digitals Branding Services LLC`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `You are an expert outreach copywriter. Your task is to write ONE cold outreach email following the exact template and rules below.

---

## WHO YOU ARE WRITING FOR:
- Sender: ${sender}
- Company: Ibra Digitals Branding Services LLC
- What they do: International affiliate marketing and digital branding agency (Singapore, UAE, UK, USA, India)
- Their properties: TravelNags, Khoj Coupons, TopVPN

## WHO YOU ARE WRITING TO:
- Company: ${company}
- Website: ${website || "unknown"}
- Partnership type: ${category || "Network"}
${offerContext ? `- Specific offer to mention: ${offerContext}` : `- Angle to use: ${cat.angle}\n- Value to highlight: ${cat.value}`}

---

## PERFECT EXAMPLE EMAILS (copy this exact style, structure, and tone):

Example 1 — Network category:
Subject: Your Network + Our Traffic — Good Fit?

Hi AdCombo,

AdCombo's CPA network covers exactly the geos our media buying team targets — we push high-intent traffic across UAE, UK, and India daily.

Ibra Digitals is an affiliate marketing agency running owned properties (TravelNags, Khoj Coupons, TopVPN) with audiences that convert well on performance offers.

Worth a quick 10-minute call to see if there's a fit?

Best,
Ashir Ayaan
Ibra Digitals Branding Services LLC

---

Example 2 — CPS category:
Subject: Driving Sales for [Company]'s Offers

Hi MaxBounty,

MaxBounty's reputation for high-converting CPS offers makes them a natural fit for our content-driven traffic strategy.

Ibra Digitals runs niche properties across travel, tech, and finance with audiences already primed to buy — we drive organic sales, not just clicks.

Open to a quick chat this week?

Best,
Ashir Ayaan
Ibra Digitals Branding Services LLC

---

Example 3 — Mobile category:
Subject: App Installs From Our Mobile Audience?

Hi Mobvista,

Mobvista's mobile-first platform aligns perfectly with the audience we've built across our digital properties — highly engaged, geo-targeted users in Asia and the Gulf.

Ibra Digitals specialises in driving quality app installs and mobile engagement across Singapore, UAE, India, and the UK.

Interested in exploring a campaign together?

Best,
Ashir Ayaan
Ibra Digitals Branding Services LLC

---

## NOW WRITE THE ACTUAL EMAIL FOR ${company}:

Follow this checklist line by line:

SUBJECT LINE:
✅ Under 8 words
✅ Specific to ${company} or their niche
✅ Curiosity-driving
✅ No ALL CAPS, no "Partnership Opportunity", no "Collaboration Request"

BODY LINE 1 (Hook):
✅ Start with "Hi ${company}," (use company name, never "Dear Sir/Madam")
✅ Next sentence: reference something specific about ${company} based on their domain/niche/category
✅ Do NOT start with "I hope", "I wanted to", "I came across", "We noticed that" (too weak)

BODY LINES 2-3 (Bridge):
✅ ONE sentence saying what Ibra Digitals is
✅ ONE sentence connecting their work to what Ibra Digitals does

BODY LINES 4-5 (Value — what's in it for THEM):
✅ Specific benefit: ${offerContext || cat.value}
✅ Make it about their gain, not your need

BODY LINE 6 (CTA):
✅ Exactly ONE ask
✅ Low-friction: "Open to a quick chat?" or "Worth a 10-minute call?" or "Interested in exploring?"
✅ NOT "Please schedule a 30-minute call" or "Let me know your availability"

SIGN-OFF:
✅ "Best," then new line "${sender}" then new line "Ibra Digitals Branding Services LLC"

BANNED WORDS (using any of these = failure):
❌ hope, synergy, leverage, innovative, excited, touch base, circle back, game changer
❌ "I hope this email finds you well"
❌ "I wanted to reach out"
❌ "mutual benefit" / "mutual growth"
❌ "look forward to connecting"
❌ "I came across your website"
❌ [placeholder], [Your Name], [Company], [insert anything]
❌ "revolutionizing" / "disrupting"

LENGTH: Body must be under ${charLimit} characters total.

Return ONLY valid JSON, nothing else:
{"subject": "the subject line here", "body": "the full email body here with \\n for line breaks"}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: Math.ceil(charLimit / 2) + 300,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an expert outreach email copywriter. You follow instructions exactly. You never use clichés. You write like a real person. You always return valid JSON with 'subject' and 'body' keys.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");

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
