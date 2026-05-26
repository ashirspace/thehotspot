const BANNED_PHRASES = [
  "i hope this email finds you well",
  "i wanted to reach out",
  "came across your website",
  "synergy",
  "leverage",
  "game changer",
  "revolutionary",
  "touch base",
  "circle back",
  "hop on a call",
  "mutual benefit",
  "win-win",
  "exciting opportunity",
  "dear sir/madam",
];

const GENERIC_LOCAL_PARTS = new Set([
  "info", "contact", "hello", "hi", "support", "admin", "team", "partnerships",
  "partner", "affiliate", "affiliates", "marketing", "sales", "press", "media",
  "business", "office", "mail", "help", "noreply", "no-reply", "enquiries",
  "enquiry", "general", "webmaster",
]);

const TEMPLATE_PLAYBOOKS = {
  Network: {
    label: "affiliate network partnership",
    subject: "traffic, offers, or partner growth",
    hook: "Recognize their network, offers, geos, publisher base, or acquisition focus.",
    value: "Position relevant traffic, publisher reach, partner revenue, and a clean test campaign.",
    cta: "Ask for a quick fit check or partner contact.",
    fallback: "We can send qualified traffic to relevant offers from owned digital properties and test quickly without heavy setup.",
  },
  CPS: {
    label: "cost-per-sale revenue growth",
    subject: "sales, buyers, or commission growth",
    hook: "Reference products, ecommerce categories, coupons, reviews, or buyer-intent audiences.",
    value: "Emphasize incremental sales, tracked revenue, commission-based upside, and low-risk testing.",
    cta: "Ask whether a small CPS test makes sense.",
    fallback: "We can promote products through buyer-intent content and coupon properties where performance is tied to actual sales.",
  },
  CPL: {
    label: "cost-per-lead acquisition",
    subject: "qualified leads or pipeline",
    hook: "Reference the audience, vertical, funnel, form-fill, demo, or quote-request use case.",
    value: "Emphasize lead quality, audience fit, clear targeting, and measurable pipeline contribution.",
    cta: "Ask whether they are open to reviewing lead criteria.",
    fallback: "We can drive qualified leads from targeted content and paid channels with clear filters before volume scales.",
  },
  CPA: {
    label: "cost-per-action performance marketing",
    subject: "verified actions or acquisition",
    hook: "Reference the conversion action, campaign type, region, compliance need, or offer category.",
    value: "Emphasize verified actions, controlled testing, clean tracking, and performance discipline.",
    cta: "Ask whether they are open to testing one offer.",
    fallback: "We can deliver measured actions through performance channels with a controlled test before increasing spend.",
  },
  Mobile: {
    label: "mobile app distribution",
    subject: "app installs, users, or retention",
    hook: "Reference the app category, user problem, app store audience, or growth stage.",
    value: "Emphasize installs, engaged users, mobile-first placements, and efficient acquisition.",
    cta: "Ask whether mobile growth is a current priority.",
    fallback: "We can put mobile apps in front of relevant audiences through content, placements, and performance campaigns.",
  },
  Partnership: {
    label: "strategic partnership",
    subject: "partner fit, audience overlap, or co-growth",
    hook: "Reference the company focus, audience, category position, or complementary offer.",
    value: "Emphasize clear audience overlap, simple collaboration, and practical next-step value.",
    cta: "Ask if a 10-minute fit check is worth it.",
    fallback: "There is a practical audience overlap between our work and theirs that could become a simple partnership test.",
  },
  Revenue: {
    label: "revenue growth outreach",
    subject: "traffic, leads, sales, or revenue",
    hook: "Reference where their revenue motion likely depends on qualified traffic, leads, or conversions.",
    value: "Emphasize measurable growth, performance upside, and a testable channel.",
    cta: "Ask whether they want to compare numbers.",
    fallback: "We can create a measured growth channel that sends qualified traffic and tracks revenue outcomes.",
  },
  Integration: {
    label: "SaaS integration partnership",
    subject: "workflow fit or product integration",
    hook: "Reference their product workflow, customer use case, or tool ecosystem.",
    value: "Emphasize user demand, workflow completion, acquisition, and a clear integration reason.",
    cta: "Ask if their partnerships or product team would review it.",
    fallback: "A lightweight integration could make both products more useful for overlapping users.",
  },
  Agency: {
    label: "agency collaboration",
    subject: "campaign reach or client outcomes",
    hook: "Reference their client work, creative category, campaign execution, or growth services.",
    value: "Emphasize distribution, performance, client outcomes, and extra reach without extra headcount.",
    cta: "Ask if one current campaign is worth testing.",
    fallback: "We can help extend strong agency campaigns into targeted paid and content distribution.",
  },
  Startup: {
    label: "startup growth distribution",
    subject: "users, growth, or distribution",
    hook: "Reference their product, ICP, growth stage, or category.",
    value: "Emphasize reaching the right users quickly, learning from a small test, and avoiding broad paid waste.",
    cta: "Ask if distribution is a current priority.",
    fallback: "We can place their product in front of relevant audiences and test whether the channel converts.",
  },
  Business: {
    label: "B2B outreach",
    subject: "growth or partnership",
    hook: "Reference their business category and likely commercial priority.",
    value: "Emphasize one clear business outcome and a low-friction first test.",
    cta: "Ask for a short conversation.",
    fallback: "We can explore a focused test that brings relevant demand to their business.",
  },
};

function normalizeCategory(category = "") {
  const raw = String(category || "").trim();
  const alias = {
    all: "Business",
    affiliate: "Network",
    affiliates: "Network",
    network: "Network",
    cps: "CPS",
    cpl: "CPL",
    cpa: "CPA",
    mobile: "Mobile",
    partnership: "Partnership",
    revenue: "Revenue",
    integration: "Integration",
    agency: "Agency",
    startup: "Startup",
  };
  return alias[raw.toLowerCase()] || raw || "Business";
}

function getPlaybook(category) {
  return TEMPLATE_PLAYBOOKS[category] || TEMPLATE_PLAYBOOKS.Business;
}

function cleanInput(value = "", fallback = "") {
  const cleaned = String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function nameFromEmail(addr, company) {
  if (!addr || !addr.includes("@")) return "";
  const local = addr.split("@")[0].toLowerCase().replace(/[._\-+]/g, " ").trim();
  const words = local.split(" ").filter(Boolean);
  if (!words.length || GENERIC_LOCAL_PARTS.has(words[0])) return "";
  const extracted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  if (company && extracted.toLowerCase() === company.toLowerCase()) return "";
  return extracted;
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function removeBannedPhrases(value = "") {
  let cleaned = value;
  for (const phrase of BANNED_PHRASES) {
    cleaned = cleaned.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  }
  return cleaned;
}

function compactLines(value = "") {
  return value
    .split("\n")
    .map(line => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanSubject(subject = "", company = "your company", playbook = TEMPLATE_PLAYBOOKS.Business) {
  let cleaned = stripHtml(subject)
    .replace(/^subject:\s*/i, "")
    .replace(/["“”]/g, "")
    .replace(/—/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /partnership opportunity/i.test(cleaned) || cleaned.length > 70) {
    cleaned = `${company} + ${playbook.subject.split(",")[0]}`;
  }

  return cleaned
    .split(" ")
    .slice(0, 9)
    .join(" ")
    .replace(/[.!?]+$/, "")
    .trim();
}

function ensureSignature(body, sender, senderTitle, senderCo) {
  const signoff = `Best,\n${sender}${senderTitle ? `\n${senderTitle}` : ""}\n${senderCo}`;
  const withoutOldSignature = body.replace(/\n{1,2}(best|regards|thanks|thank you|sincerely|cheers),?\s*\n[\s\S]*$/i, "").trim();
  return `${withoutOldSignature}\n\n${signoff}`;
}

function cleanBody(body = "", { greeting, company, sender, senderTitle, senderCo, fallbackBody, charLimit }) {
  let cleaned = stripHtml(body || fallbackBody)
    .replace(/\\n/g, "\n")
    .replace(/—/g, "-")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\([^)]+placeholder[^)]*\)/gi, "");

  cleaned = removeBannedPhrases(cleaned);
  cleaned = compactLines(cleaned);

  const lines = cleaned.split("\n").map(line => line.trim()).filter(Boolean);
  const contentLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    if (/^subject:/i.test(line)) return false;
    if (/^hi\b/i.test(line)) return false;
    if (lower === company.toLowerCase()) return false;
    return true;
  });

  cleaned = [`Hi ${greeting},`, "", ...contentLines].join("\n");
  cleaned = ensureSignature(cleaned, sender, senderTitle, senderCo);

  const hardLimit = charLimit + 180;
  if (cleaned.length > hardLimit) {
    const signature = `\n\nBest,\n${sender}${senderTitle ? `\n${senderTitle}` : ""}\n${senderCo}`;
    const bodyWithoutSignature = cleaned.replace(/\n{1,2}best,?\s*\n[\s\S]*$/i, "").trim();
    const cut = bodyWithoutSignature.lastIndexOf("\n\n", Math.max(charLimit, 220));
    const trimmed = cut > 180 ? bodyWithoutSignature.slice(0, cut).trim() : bodyWithoutSignature.slice(0, charLimit).trim();
    cleaned = `${trimmed}${signature}`;
  }

  return compactLines(cleaned);
}

function buildFallbackEmail({ company, greeting, offer, sender, senderTitle, senderCo, playbook }) {
  return {
    subject: cleanSubject(`Quick idea for ${company}`, company, playbook),
    body: ensureSignature(`Hi ${greeting},\n\n${company} looks like a strong fit for ${playbook.label}.\n\n${offer || playbook.fallback}\n\nIf this is a priority, would a quick 10-minute fit check make sense?`, sender, senderTitle, senderCo),
  };
}

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
  const categoryKey = normalizeCategory(category);
  const playbook = getPlaybook(categoryKey);

  if (!API_KEY) {
    return res.status(200).json({ angle: playbook.fallback });
  }

  const prompt = `Write ONE cold email pitch angle for ${playbook.label}.

Rules:
- One sentence only, max 25 words
- Use this value direction: ${playbook.value}
- Start with a specific value statement or observation, not "I" or "We"
- No clichés: no "synergy", "leverage", "game-changer", "exciting opportunity", "win-win"
- Confident, professional, and direct
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
    return res.status(200).json({ angle: angle || playbook.fallback });
  } catch {
    return res.status(200).json({ angle: playbook.fallback });
  }
}

// ── Generate full email ────────────────────────────────────────────────────────
async function handleEmail({ company, contactName, email, category, website, offerContext, senderName, senderCompany, senderRole, valueProp, maxChars }, res) {
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = cleanInput(senderName, "Ashir Ayaan");
  const senderCo = cleanInput(senderCompany, "Ibra Digitals Branding Services LLC");
  const senderTitle = cleanInput(senderRole, "");
  const recipientCompany = cleanInput(company, "the company");
  const categoryKey = normalizeCategory(category);
  const playbook = getPlaybook(categoryKey);
  const offer = cleanInput(offerContext || valueProp, playbook.fallback);
  const recipientWebsite = cleanInput(website, "not provided");

  const rawName = cleanInput(contactName, "");
  const emailName = nameFromEmail(email, recipientCompany);
  const resolvedName = rawName && rawName.toLowerCase() !== recipientCompany.toLowerCase() ? rawName : emailName;
  const greeting = resolvedName ? resolvedName.split(" ")[0] : "there";
  const charLimit = Math.min(Math.max(parseInt(maxChars) || 640, 260), 1200);
  const lineTarget = charLimit <= 400 ? "4-6 lines" : charLimit <= 700 ? "6-8 lines" : "9-12 lines";
  const lineDetail = charLimit <= 400
    ? "4 to 6 lines of actual content. Each line is one short sentence or phrase. No padding, no filler."
    : charLimit <= 700
    ? "6 to 8 lines of content. Use two short paragraphs. Every sentence must add context, value, or a next step."
    : "9 to 12 lines of content. Use 3 short paragraphs. Give full context: why them, what you offer, why it matters, and the ask.";

  const fallback = buildFallbackEmail({ company: recipientCompany, greeting, offer, sender, senderTitle, senderCo, playbook });

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `Write one professional, attractive B2B outreach email. It must feel handcrafted for the recipient, not generic.

---

## SENDER INFO:
- Name: ${sender}
- Company: ${senderCo}${senderTitle ? `\n- Role: ${senderTitle}` : ""}
- Offer / query from user: ${offer}

## RECIPIENT INFO:
- Contact Person: ${greeting}
- Company: ${recipientCompany}
- Website: ${recipientWebsite}
- Template / category: ${categoryKey}

## TEMPLATE PLAYBOOK:
- Template purpose: ${playbook.label}
- Subject angle: ${playbook.subject}
- Hook guidance: ${playbook.hook}
- Value guidance: ${playbook.value}
- CTA guidance: ${playbook.cta}

---

## STYLE STANDARD:
- Polished, commercially sharp, and human.
- Specific to the template, category, recipient company, website, and user query.
- Use concrete business language: traffic, sales, leads, users, installs, verified actions, partner revenue, pipeline, or campaign reach when relevant.
- Make the recipient's gain clear before asking for anything.
- Warm but direct. No hype. No spam tone.
- Do not invent fake metrics, fake clients, fake awards, or fake personal observations.
- If website detail is limited, infer from company/category cautiously and avoid pretending you researched a specific page.
- Plain text only. The sending layer will convert it into HTML.

## EXAMPLES OF THE VOICE:

Subject: Relevant Traffic for Your Offers
Hi Marcus,

AdCombo's CPA network maps closely to the geos our owned media properties already reach.

We can start with a focused traffic test around offers where quality and tracking matter most.

Worth a quick 10-minute call to see if there's a fit?

Best,
Ashir Ayaan
Ibra Digitals Branding Services LLC

---

Subject: Our Users Keep Asking for This
Hi there,

Notion solves the workspace problem our power users keep raising when they plan projects across teams.

A lightweight integration could make that workflow easier and give both products a clearer distribution path.

Open to reviewing whether this belongs with your product team?

Best,
Sarah Chen
Head of Partnerships, Acme SaaS

---

Subject: Extra Reach for Client Campaigns
Hi James,

Ogilvy's campaign work is exactly the kind of creative that benefits from sharper distribution after launch.

We help agencies extend strong creative into targeted paid and content placements without adding delivery load to the team.

Worth testing on one current campaign?

Best,
James Okafor
Growth Lead, Ampli Agency

---

## NOW WRITE THE EMAIL FOR ${recipientCompany}

Required structure:

1. Subject: under 9 words, specific to ${recipientCompany} or ${categoryKey}. No "Partnership Opportunity". No emojis.
2. Greeting: exactly "Hi ${greeting},"
3. Hook: one specific sentence about the recipient/category.
4. Bridge: one short sentence about ${senderCo} and why the offer/query is relevant.
5. Value: one or two sentences focused on what ${recipientCompany} gains.
6. CTA: one low-friction ask. One CTA only.
7. Signature exactly:
Best,
${sender}${senderTitle ? `\n${senderTitle}` : ""}
${senderCo}

Important formatting:
- Do NOT put the company name on a standalone line after the greeting.
- Do NOT include markdown, bullets, numbering, tables, or HTML.
- Use short paragraphs with blank lines between them.
- Use "\\n" line breaks in JSON.

## HARD BANNED:
- "I hope this email finds you well"
- "I wanted to reach out"
- "I came across your website"
- "synergy" / "leverage" / "innovative" / "game changer" / "revolutionary"
- "touch base" / "circle back" / "hop on a call"
- "mutual benefit" / "win-win" / "exciting opportunity"
- "Dear Sir/Madam"
- [placeholder] / [Your Name] / [insert] - any unfilled brackets
- More than ONE call-to-action
- Em dashes - use a hyphen or rewrite the sentence naturally

## LENGTH:
Write exactly ${lineTarget} of content in the body. ${lineDetail}

Return ONLY valid JSON - no markdown, no explanation:
{"subject": "...", "body": "..."}
Use \\n for line breaks. No HTML.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: Math.ceil(charLimit / 2) + 320,
        temperature: 0.72,
        presence_penalty: 0.15,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a senior B2B cold email copywriter. You write polished, specific, human emails. You always return valid JSON with exactly two keys: subject and body." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const subject = cleanSubject(parsed.subject || fallback.subject, recipientCompany, playbook);
    const body = cleanBody(parsed.body || fallback.body, {
      greeting,
      company: recipientCompany,
      sender,
      senderTitle,
      senderCo,
      fallbackBody: fallback.body,
      charLimit,
    });

    res.status(200).json({ subject, body });
  } catch {
    res.status(200).json(fallback);
  }
}
