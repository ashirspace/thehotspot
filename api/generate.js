export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { type, ...body } = req.body || {};

  if (type === "angle") return handleAngle(body, res);
  return handleEmail(body, res);
}

// ── Generate pitch angle ───────────────────────────────────────────────────────
async function handleAngle({ category, current }, res) {
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

// ── Generate full email ────────────────────────────────────────────────────────
async function handleEmail({ company, contactName, email, category, website, offerContext, senderName, senderCompany, senderRole, valueProp, maxChars }, res) {
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender      = senderName    || "Ashir Ayaan";
  const senderCo    = senderCompany || "Ibra Digitals Branding Services LLC";
  const senderTitle = senderRole    || "";

  const GENERIC = new Set(["info","contact","hello","hi","support","admin","team","partnerships","partner","affiliate","affiliates","marketing","sales","press","media","business","office","mail","help","noreply","no-reply","enquiries","enquiry","general","webmaster"]);
  const nameFromEmail = (addr) => {
    if (!addr || !addr.includes("@")) return "";
    const local = addr.split("@")[0].toLowerCase().replace(/[._\-+]/g, " ").trim();
    const words = local.split(" ").filter(Boolean);
    if (!words.length || GENERIC.has(words[0])) return "";
    const extracted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (company && extracted.toLowerCase() === (company || "").toLowerCase()) return "";
    return extracted;
  };

  const rawName = (contactName || "").trim();
  const emailName = nameFromEmail(email);
  const resolvedName = (rawName && rawName.toLowerCase() !== (company || "").toLowerCase()) ? rawName : emailName;
  const greeting = resolvedName ? resolvedName.split(" ")[0] : "there";
  const charLimit  = Math.min(Math.max(parseInt(maxChars) || 560, 100), 1200);
  const lineTarget = charLimit <= 400 ? "4–6 lines" : charLimit <= 650 ? "6–8 lines" : "10–12 lines";
  const lineDetail = charLimit <= 400
    ? "4 to 6 lines of actual content. Each line is one short sentence or phrase. No padding, no filler."
    : charLimit <= 650
    ? "6 to 8 lines of content. Can include 2 short paragraphs. Still tight — every sentence earns its place."
    : "10 to 12 lines of content. Use 3–4 paragraphs. Give full context: who you are, what you offer, why it fits them, and what you want from them.";

  const fallback = {
    subject: `Quick question for ${company}`,
    body: `Hi ${greeting},\n${company}\n\n${offerContext || valueProp || "I think there's a natural fit between what we do and what you've built."}\n\n${senderCo} — ${offerContext || "we'd love to explore if there's a way to work together."}\n\nOpen to a quick chat?\n\nBest,\n${sender}${senderTitle ? `\n${senderTitle}` : ""}\n${senderCo}`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const angleMap = {
    Network: "Partnership/Revenue — drive quality traffic to their network offers through owned media properties",
    CPS:     "Revenue — drive sales through content marketing and SEO on niche properties",
    CPL:     "Revenue — generate qualified leads through targeted content and paid campaigns",
    CPA:     "Revenue — deliver verified actions through performance marketing channels",
    Mobile:  "Distribution — drive app installs and mobile engagement through digital properties",
  };
  const angle = angleMap[category] || (offerContext ? "Custom — see offer details below" : "Partnership — natural fit between both companies");

  const prompt = `You are an expert B2B outreach copywriter. Write ONE cold email following the rules and examples below exactly.

---

## SENDER INFO:
- Name: ${sender}
- Company: ${senderCo}${senderTitle ? `\n- Role: ${senderTitle}` : ""}
- Angle/Offer: ${offerContext || valueProp || angle}

## RECIPIENT INFO:
- Contact Person: ${greeting}
- Company: ${company}
- Website: ${website || "unknown"}
- Category/Industry: ${category || "Business"}

---

## THREE PERFECT EXAMPLE EMAILS (match this style exactly):

### Example 1 — Affiliate / Network:
Subject: Your Network + Our Traffic — Good Fit?

Hi Marcus,
AdCombo

AdCombo's CPA network covers exactly the geos our media buying team targets — UAE, UK, and India daily.

Ibra Digitals runs owned properties (TravelNags, Khoj Coupons, TopVPN) with audiences that convert well on performance offers.

Worth a quick 10-minute call to see if there's a fit?

Best,
Ashir Ayaan
Ibra Digitals Branding Services LLC

---

### Example 2 — SaaS / Integration:
Subject: Our Users Keep Asking for This

Hi there,
Notion

Notion's workspace flexibility is exactly what our power users want — we keep getting requests for a native integration.

Acme SaaS connects 40,000 project managers to their tools daily. A two-way integration could unlock a new acquisition channel for both sides.

Open to a quick chat with our partnerships team?

Best,
Sarah Chen
Head of Partnerships, Acme SaaS

---

### Example 3 — Agency / Collaboration:
Subject: Client Result You Might Find Interesting

Hi James,
Ogilvy

Ogilvy's recent work on the Nike campaign showed exactly the kind of data-driven creative we specialise in amplifying.

We run paid distribution for agencies like yours — taking award-winning creative and getting it in front of the right audience at scale.

Interested in seeing what this looks like for one of your current campaigns?

Best,
James Okafor
Growth Lead, Ampli Agency

---

## NOW WRITE THE EMAIL FOR ${company}:

Follow this structure line by line:

**SUBJECT:** Under 8 words. Specific to ${company} or their niche. No "Partnership Opportunity". No emojis. No ALL CAPS.

**GREETING:** First line: "Hi ${greeting}," — Second line (no blank line between): "${company}" — Then a blank line before the body begins.

**LINE 1 — HOOK:** ONE sentence referencing something specific about ${company} based on their website/industry/niche. Make it clear you know who they are.

**LINES 2-3 — BRIDGE:** ONE sentence describing what ${senderCo} is/does (max). ONE sentence connecting ${senderCo}'s offer to ${company}'s world. Use this: ${offerContext || valueProp || angle}

**LINES 4-5 — VALUE:** What ${company} GAINS. Be specific. Revenue, traffic, leads, users, exposure — whatever fits. Not what ${senderCo} wants, what ${company} gets.

**LINE 6 — CTA:** ONE ask. Low-friction. Examples: "Worth a 10-minute call?", "Open to a quick chat?", "Interested in exploring this?". Nothing longer.

**SIGN-OFF:**
Best,
${sender}${senderTitle ? `\n${senderTitle}` : ""}
${senderCo}

---

## HARD BANNED (instant failure if used):
- "I hope this email finds you well"
- "I wanted to reach out"
- "I came across your website"
- "synergy" / "leverage" / "innovative" / "game changer" / "revolutionary"
- "touch base" / "circle back" / "hop on a call"
- "mutual benefit" / "win-win" / "exciting opportunity"
- "Dear Sir/Madam"
- [placeholder] / [Your Name] / [insert] — any unfilled brackets
- More than ONE call-to-action
- Em dashes (—) — use a hyphen (-) or rewrite the sentence naturally

## LENGTH: Write exactly ${lineTarget} of content in the body. ${lineDetail}

Return ONLY valid JSON — no markdown, no explanation:
{"subject": "...", "body": "..."}
Use \\n for line breaks. No HTML.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: Math.ceil(charLimit / 2) + 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are an expert B2B cold email copywriter. You follow instructions exactly. You never use clichés. You write like a real human professional. You always return valid JSON with exactly two keys: 'subject' and 'body'." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    let emailBody = (parsed.body || fallback.body).replace(/—/g, "-");

    emailBody = emailBody.replace(/^[\s\S]*?(?=\n\n)/, (header) => {
      const lines = header.split("\n").map(l => l.trim()).filter(Boolean);
      const bodyLines = lines.filter(l => !l.match(/^hi\b/i) && l.toLowerCase() !== company.toLowerCase());
      return [`Hi ${greeting},`, company, ...bodyLines].join("\n");
    });

    const hardLimit = charLimit + 80;
    if (emailBody.length > hardLimit) {
      const cut = emailBody.lastIndexOf("\n", charLimit);
      emailBody = cut > charLimit * 0.5
        ? emailBody.slice(0, cut) + `\n\nBest,\n${sender}${senderTitle ? `\n${senderTitle}` : ""}\n${senderCo}`
        : emailBody.slice(0, charLimit);
    }

    res.status(200).json({ subject: parsed.subject || fallback.subject, body: emailBody });
  } catch {
    res.status(200).json(fallback);
  }
}
