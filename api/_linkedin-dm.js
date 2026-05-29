const CATEGORY_RULES = [
  { category: "Founder/Executive", reason: "Owns company direction and high-level partnership decisions.", re: /\b(founder|co-founder|ceo|chief executive|president|owner|managing director|general manager)\b/i },
  { category: "Partnerships", reason: "Owns partner, channel, affiliate, or business development conversations.", re: /\b(partnerships?|partner|alliance|business development|biz dev|affiliate|channel)\b/i },
  { category: "Marketing/Growth", reason: "Owns demand generation, brand, performance, or growth channels.", re: /\b(marketing|growth|demand|performance|acquisition|brand|content|seo|paid media)\b/i },
  { category: "Sales", reason: "Owns revenue conversations, pipeline, and commercial expansion.", re: /\b(sales|revenue|commercial|account executive|business development representative|sdr|bdr)\b/i },
  { category: "HR", reason: "Owns people, hiring, talent, or employer-brand conversations.", re: /\b(hr|people|talent|recruit|human resources|hiring)\b/i },
  { category: "Engineering/Product", reason: "Owns product, platform, technical, or integration decisions.", re: /\b(engineer|engineering|product|cto|technology|technical|developer|platform)\b/i },
];

const GOAL_LABELS = {
  partnership: "partnership conversation",
  affiliate: "affiliate or partner program conversation",
  sales: "sales or revenue conversation",
  hiring: "hiring or talent conversation",
  "founder-intro": "founder introduction",
  custom: "custom business conversation",
};

function clean(value = "", fallback = "") {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

function categorizePerson(person = {}) {
  if (person.category) {
    return { category: clean(person.category, "Other"), reason: "User-selected outreach category." };
  }
  const haystack = [person.title, person.department, person.seniority, person.notes].filter(Boolean).join(" ");
  const match = CATEGORY_RULES.find(rule => rule.re.test(haystack));
  return match || { category: "Other", reason: "Role does not map clearly to a primary outreach category." };
}

function trimMessage(value = "") {
  return String(value || "")
    .replace(/—/g, "-")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\b(i hope this finds you well|just touching base|synergy|game changer|revolutionary)\b/gi, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 650);
}

function fallbackMessage({ company, goal, offerContext, tone, person, category }) {
  const firstName = clean(person.name, "there").split(" ")[0] || "there";
  const role = clean(person.title || category, "your role");
  const goalText = GOAL_LABELS[goal] || GOAL_LABELS.custom;
  const offer = clean(offerContext, "there may be a practical way for us to work together").replace(/[.!?]+$/, "");
  const article = /^[aeiou]/i.test(goalText) ? "an" : "a";
  const directAsk = tone === "direct" ? "Worth a quick look?" : "Open to a quick conversation?";

  return trimMessage(
    `Hi ${firstName}, noticed your work around ${role} at ${company}. ${offer}. Since this connects to ${article} ${goalText}, I thought you may be the right person to ask. ${directAsk}`
  );
}

function normalizePeople(people = []) {
  return people
    .filter(Boolean)
    .map((person, index) => ({
      id: person.id || `person-${index + 1}`,
      name: clean(person.name),
      title: clean(person.title),
      linkedinUrl: clean(person.linkedinUrl || person.linkedin_url),
      department: clean(person.department),
      seniority: clean(person.seniority),
      notes: clean(person.notes),
      category: clean(person.category),
    }))
    .filter(person => person.name && person.linkedinUrl);
}

async function generateWithOpenAI({ company, website, goal, offerContext, tone, people }) {
  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) return null;

  const prompt = `Generate LinkedIn DM outreach drafts.

Company: ${company}
Website/domain: ${website || "not provided"}
Goal: ${GOAL_LABELS[goal] || goal}
Offer/context: ${offerContext}
Tone: ${tone}

People:
${people.map((person, i) => {
  const cat = categorizePerson(person);
  return `${i + 1}. ${person.name} | ${person.title || "Unknown title"} | ${person.linkedinUrl} | suggested category: ${cat.category} | notes: ${person.notes || "none"}`;
}).join("\n")}

Rules:
- Return one draft per person.
- 300 to 600 characters per DM.
- No fake claims, no invented relationship, no spam language.
- No email signature, no markdown, no bullets inside messages.
- One clear ask only.
- Personalize using name, role/category, company, notes, and offer context.
- Categorize each person as one of: Founder/Executive, Partnerships, Marketing/Growth, Sales, HR, Engineering/Product, Other.

Return valid JSON only:
{"drafts":[{"name":"...","title":"...","linkedinUrl":"...","category":"...","reason":"...","message":"..."}]}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.72,
      max_tokens: Math.min(people.length * 260 + 500, 3500),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You write concise, professional LinkedIn DMs for B2B outreach. You always return valid JSON." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

async function persistCampaign(sql, payload, drafts) {
  const campaignRows = await sql`
    INSERT INTO linkedin_campaigns (user_id, company, website, goal, offer_context, tone, status, draft_count, approved_count, sent_count, skipped_count, updated_at)
    VALUES (${payload.userId || "unknown"}, ${payload.company}, ${payload.website || ""}, ${payload.goal}, ${payload.offerContext || ""}, ${payload.tone || "professional"}, 'draft', ${drafts.length}, 0, 0, 0, NOW())
    RETURNING id
  `;
  const campaignId = campaignRows[0]?.id || null;
  const saved = [];
  for (const draft of drafts) {
    const rows = await sql`
      INSERT INTO linkedin_dm_drafts (campaign_id, name, title, linkedin_url, department, seniority, notes, category, reason, message, approved, status, updated_at)
      VALUES (${campaignId}, ${draft.name || ""}, ${draft.title || ""}, ${draft.linkedinUrl || ""}, ${draft.department || ""}, ${draft.seniority || ""}, ${draft.notes || ""}, ${draft.category || ""}, ${draft.reason || ""}, ${draft.message || ""}, false, 'draft', NOW())
      RETURNING id
    `;
    saved.push({ ...draft, id: String(rows[0]?.id || draft.id), campaignId });
  }
  return { campaignId, drafts: saved };
}

async function updateDraftStatus(sql, body) {
  const { draftId, campaignId, status, approved, message } = body;
  if (!draftId) throw new Error("Missing draftId");
  const allowed = new Set(["draft", "approved", "sent", "skipped"]);
  const nextStatus = allowed.has(status) ? status : null;
  await sql`
    UPDATE linkedin_dm_drafts
    SET status = COALESCE(${nextStatus}, status),
        approved = COALESCE(${typeof approved === "boolean" ? approved : null}, approved),
        message = COALESCE(${message ?? null}, message),
        updated_at = NOW()
    WHERE id = ${parseInt(draftId)}
  `;
  if (campaignId) {
    await sql`
      UPDATE linkedin_campaigns
      SET approved_count = (SELECT COUNT(*)::int FROM linkedin_dm_drafts WHERE campaign_id = ${parseInt(campaignId)} AND approved = true),
          sent_count = (SELECT COUNT(*)::int FROM linkedin_dm_drafts WHERE campaign_id = ${parseInt(campaignId)} AND status = 'sent'),
          skipped_count = (SELECT COUNT(*)::int FROM linkedin_dm_drafts WHERE campaign_id = ${parseInt(campaignId)} AND status = 'skipped'),
          status = CASE
            WHEN (SELECT COUNT(*) FROM linkedin_dm_drafts WHERE campaign_id = ${parseInt(campaignId)} AND status = 'sent') > 0 THEN 'active'
            ELSE status
          END,
          updated_at = NOW()
      WHERE id = ${parseInt(campaignId)}
    `;
  }
}

async function listCampaigns(sql, body) {
  const userId = clean(body.userId, "dashboard-user");
  const campaignRows = await sql`
    SELECT * FROM linkedin_campaigns
    WHERE user_id = ${userId} OR user_id = 'unknown'
    ORDER BY updated_at DESC
    LIMIT 10
  `;
  const campaigns = [];
  for (const campaign of campaignRows) {
    const drafts = await sql`
      SELECT id, campaign_id, name, title, linkedin_url, department, seniority, notes, category, reason, message, approved, status, created_at, updated_at
      FROM linkedin_dm_drafts
      WHERE campaign_id = ${campaign.id}
      ORDER BY id ASC
    `;
    campaigns.push({
      id: campaign.id,
      company: campaign.company,
      website: campaign.website,
      goal: campaign.goal,
      offerContext: campaign.offer_context,
      tone: campaign.tone,
      status: campaign.status,
      draftCount: campaign.draft_count,
      approvedCount: campaign.approved_count,
      sentCount: campaign.sent_count,
      skippedCount: campaign.skipped_count,
      updatedAt: campaign.updated_at,
      drafts: drafts.map(draft => ({
        id: String(draft.id),
        campaignId: draft.campaign_id,
        name: draft.name,
        title: draft.title,
        linkedinUrl: draft.linkedin_url,
        department: draft.department,
        seniority: draft.seniority,
        notes: draft.notes,
        category: draft.category,
        reason: draft.reason,
        message: draft.message,
        approved: draft.approved,
        status: draft.status,
      })),
    });
  }
  return campaigns;
}

export async function handleLinkedInDm(req, res, sql = null) {
  const body = req.body || {};
  try {
    if (body.action === "listCampaigns") {
      if (!sql) return res.status(200).json({ ok: true, persisted: false, campaigns: [] });
      const campaigns = await listCampaigns(sql, body);
      return res.status(200).json({ ok: true, persisted: true, campaigns });
    }

    if (body.action === "updateStatus") {
      if (!sql) return res.status(200).json({ ok: true, persisted: false });
      await updateDraftStatus(sql, body);
      return res.status(200).json({ ok: true, persisted: true });
    }

    const company = clean(body.company);
    const people = normalizePeople(body.people || []);
    if (!company) return res.status(400).json({ error: "Company is required" });
    if (!people.length) return res.status(400).json({ error: "Add at least one person with a name and LinkedIn URL" });

    const payload = {
      userId: clean(body.userId, "unknown"),
      company,
      website: clean(body.website),
      goal: clean(body.goal, "partnership"),
      offerContext: clean(body.offerContext, "A focused business conversation may be useful."),
      tone: clean(body.tone, "professional"),
    };

    let aiDrafts = [];
    try {
      const generated = await generateWithOpenAI({ ...payload, people });
      aiDrafts = Array.isArray(generated?.drafts) ? generated.drafts : [];
    } catch {
      aiDrafts = [];
    }

    const drafts = people.map((person, index) => {
      const rule = categorizePerson(person);
      const generated = aiDrafts[index] || {};
      const category = clean(generated.category, rule.category);
      return {
        id: `local-${Date.now()}-${index}`,
        name: person.name,
        title: person.title,
        linkedinUrl: person.linkedinUrl,
        department: person.department,
        seniority: person.seniority,
        notes: person.notes,
        category,
        reason: clean(generated.reason, rule.reason),
        message: trimMessage(generated.message) || fallbackMessage({ ...payload, person, category }),
        approved: false,
        status: "draft",
      };
    });

    if (sql) {
      const saved = await persistCampaign(sql, payload, drafts);
      return res.status(200).json({ ok: true, persisted: true, campaignId: saved.campaignId, drafts: saved.drafts });
    }

    return res.status(200).json({ ok: true, persisted: false, campaignId: null, drafts });
  } catch (err) {
    return res.status(500).json({ error: err.message || "LinkedIn DM generation failed" });
  }
}
