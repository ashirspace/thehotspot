const TOOLS = [
  {
    name: "send_emails",
    description: "Send cold outreach emails to contacts. Can target by category or specific email addresses.",
    input_schema: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "string" }, description: "Specific email addresses to send to" },
        category: { type: "string", enum: ["Network", "CPS", "CPL", "CPA", "Mobile", "all"], description: "Category of contacts to target" },
        offerContext: { type: "string", description: "What the email should say — offer details, tone, specific angle" },
        maxChars: { type: "number", description: "Max characters for email body (200=short, 400=medium, 800=long)" },
      },
    },
  },
  {
    name: "find_leads",
    description: "Find new business leads and potential clients using AI-powered web search. Returns a list of companies with contact info. Use this when the user wants to discover new prospects, find companies in a specific industry or region, or build their contact list.",
    input_schema: {
      type: "object",
      properties: {
        industry: { type: "string", description: "Industry or business type (e.g. 'affiliate networks', 'fintech startups', 'SaaS companies', 'e-commerce brands')" },
        geo: { type: "string", description: "Geographic region (e.g. 'Dubai', 'USA', 'UK', 'Southeast Asia')" },
        count: { type: "number", description: "Number of leads to find (default 10, max 20)" },
        category: { type: "string", enum: ["Network", "CPS", "CPL", "CPA", "Mobile"], description: "Which contact category to classify these leads as" },
      },
      required: ["industry"],
    },
  },
  {
    name: "stop_campaign",
    description: "Stop or cancel the currently running email campaign.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "schedule_emails",
    description: "Schedule an email campaign to run at a specific future time.",
    input_schema: {
      type: "object",
      properties: {
        scheduledFor: { type: "string", description: "ISO 8601 datetime for when to send" },
        category: { type: "string", description: "Contact category to target (default: all)" },
        offerContext: { type: "string", description: "What the emails should say" },
      },
      required: ["scheduledFor"],
    },
  },
  {
    name: "send_followup",
    description: "Send follow-up emails to contacts who haven't replied to a previous campaign.",
    input_schema: {
      type: "object",
      properties: {
        offerContext: { type: "string", description: "Follow-up message context" },
        daysAgo: { type: "number", description: "How many days ago the original was sent (default 3)" },
      },
    },
  },
  {
    name: "add_contact",
    description: "Add a new contact to the contacts database.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        company: { type: "string" },
        name: { type: "string" },
        category: { type: "string", enum: ["Network", "CPS", "CPL", "CPA", "Mobile"] },
        website: { type: "string" },
      },
      required: ["email"],
    },
  },
  {
    name: "remove_contact",
    description: "Remove a contact or group of contacts from the database.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Specific email to remove" },
        category: { type: "string", description: "Remove all contacts in this category" },
      },
    },
  },
  {
    name: "show_history",
    description: "Show the campaign history and sent email records.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "show_page",
    description: "Navigate to a specific page/section in the dashboard.",
    input_schema: {
      type: "object",
      properties: {
        page: {
          type: "string",
          enum: ["dashboard", "emailSender", "emailTemplates", "contacts", "campaignStatus", "totalContacts", "emailsSent", "categories", "successRate", "profile"],
          description: "Which page to navigate to",
        },
      },
      required: ["page"],
    },
  },
];

const SYSTEM_PROMPT = `You are a sharp, autonomous AI outbound sales agent built into thehotspot — the outreach platform for Ibra Digitals Branding Services LLC, an international affiliate marketing and digital branding agency (Singapore, UAE, UK, USA, India).

You help Ashir Ayaan run his entire outbound operation:
- Find new business leads (use find_leads tool proactively)
- Send personalized cold emails via Gmail
- Manage affiliate contacts across 5 categories: Network, CPS, CPL, CPA, Mobile
- Track campaigns, check replies, schedule follow-up sequences
- Give strategic advice on outreach and lead generation

CONTACT CATEGORIES:
- Network: Affiliate networks that manage multiple programs
- CPS: Cost-per-sale partners (commission per sale)
- CPL: Cost-per-lead partners (payment per qualified lead)
- CPA: Cost-per-action partners (payment per specific user action)
- Mobile: Mobile app marketing and advertising partners

CRITICAL TOOL RULES — FOLLOW THESE EXACTLY:

1. FIND_LEADS: Whenever the user mentions finding, searching, discovering, or listing any companies, startups, businesses, brands, agencies, networks, or prospects — ALWAYS call find_leads immediately. NEVER say "I can't provide real-time data." NEVER say "I don't have access to current information." The find_leads tool does the live search. You just call it. Examples that MUST trigger find_leads:
   - "find me 10 fintech startups in Dubai" → find_leads({industry:"fintech startups", geo:"Dubai", count:10})
   - "search for affiliate networks in the UK" → find_leads({industry:"affiliate networks", geo:"UK"})
   - "give me 5 e-commerce brands" → find_leads({industry:"e-commerce brands", count:5})
   - "find leads" → find_leads({industry:"affiliate marketing"})

2. SEND_EMAILS: Whenever the user wants to send, blast, or reach out via email → call send_emails immediately.

3. SCHEDULE_EMAILS: Whenever the user mentions scheduling a campaign for a future time → call schedule_emails.

4. NEVER decline to use a tool. If the request is even slightly related to finding companies or sending emails, use the tool. Your job is to act, not to explain limitations.

EMAIL LENGTH DETECTION:
- "short" / "brief" / "chhota" → maxChars: 200
- "medium" / "normal" → maxChars: 400
- "long" / "detailed" / "lamba" → maxChars: 800
- specific count like "500 chars" → maxChars: 500
- not mentioned → maxChars: null (uses default)

LANGUAGE: Reply in whatever language the user writes in — English, Hinglish, Hindi, Urdu, Punjabi, anything.

Today: ${new Date().toISOString()}`;

async function callClaude(apiKey, messages, tools) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    }),
  });
}

async function findLeads({ industry, geo, count = 10, category = "Network" }) {
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
      if (match) return JSON.parse(match[0]);
    } catch { /* fall through to OpenAI */ }
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
      const parsed = JSON.parse(d.choices?.[0]?.message?.content || "{}");
      return parsed.leads || [];
    } catch { return []; }
  }

  return [];
}

function defaultMessage(toolName) {
  return {
    send_emails: "Starting campaign now...",
    stop_campaign: "Stopping campaign...",
    schedule_emails: "Got it — scheduling your campaign.",
    send_followup: "Sending follow-up emails...",
    add_contact: "Adding contact...",
    remove_contact: "Removing contact...",
    show_history: "Here's your campaign history:",
    show_page: "Navigating...",
  }[toolName] || "On it!";
}

async function handleOpenAIFallback(res, messages, apiKey) {
  const systemPrompt = `You are a smart outreach assistant for thehotspot (Ibra Digitals). Reply ONLY with valid JSON:
{"message": "...", "action": "action_name", "params": {}}

Actions: send_emails (params: category, emails, offerContext, maxChars), stop_campaign, schedule_emails (params: scheduledFor, category, offerContext), send_followup (params: offerContext, daysAgo), add_contact (params: email, company, name, category, website), remove_contact (params: email, category), show_history, show_page (params: page), none.

Today: ${new Date().toISOString()}. Reply in the user's language.`;

  const clean = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
  const start = clean.findIndex(m => m.role === "user");
  const valid = start >= 0 ? clean.slice(start) : clean;

  if (!valid.length) {
    return res.status(200).json({ message: "Hey! I'm your outreach assistant. Tell me who to email, or ask me anything.", action: "none", params: {} });
  }

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: systemPrompt }, ...valid],
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  const parsed = JSON.parse(d.choices?.[0]?.message?.content || "{}");
  return res.status(200).json({ message: parsed.message || "Got it!", action: parsed.action || "none", params: parsed.params || {} });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!ANTHROPIC_KEY && OPENAI_KEY) {
    return handleOpenAIFallback(res, messages, OPENAI_KEY);
  }

  if (!ANTHROPIC_KEY) {
    return res.status(200).json({
      message: "Add ANTHROPIC_API_KEY in Vercel environment variables to enable the AI agent.",
      action: "none",
      params: {},
    });
  }

  const clean = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
  const start = clean.findIndex(m => m.role === "user");
  const valid = start >= 0 ? clean.slice(start) : clean;

  if (!valid.length) {
    return res.status(200).json({
      message: "Hey! I'm your AI outbound agent. I can find leads, send campaigns, check replies, and run your entire cold email operation. What do you need?",
      action: "none",
      params: {},
    });
  }

  // Detect lead-finding requests and handle them directly — don't let Claude refuse.
  const lastUserMsg = valid.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  const lastLower = lastUserMsg.toLowerCase();
  const LEAD_TRIGGERS = ["find", "search", "discover", "get me", "show me", "give me", "look for", "fetch", "locate", "dhundo", "list"];
  const LEAD_TARGETS = ["startup", "startups", "company", "companies", "brand", "brands", "agency", "agencies", "network", "networks", "lead", "leads", "prospect", "prospects", "business", "businesses", "firm", "firms", "client", "clients"];
  const isLeadRequest = LEAD_TRIGGERS.some(k => lastLower.includes(k)) && LEAD_TARGETS.some(k => lastLower.includes(k));

  if (isLeadRequest) {
    // Parse query directly — no Claude involved, guaranteed to execute
    const geoMatch = lastLower.match(/\bin\s+([\w\s]+?)(?:\s+(?:and|or|for|from)|$)/i);
    const countMatch = lastLower.match(/\b(\d+)\b/);
    const geo = geoMatch?.[1]?.trim() || "";
    const count = countMatch ? Math.min(parseInt(countMatch[1]), 20) : 10;
    // Strip action words and geo to get industry
    const industry = lastUserMsg
      .replace(/find\s*me?|search\s*(for)?|get\s*me|show\s*me|give\s*me|look\s*for|fetch|locate|dhundo|list/gi, "")
      .replace(/\b\d+\b/g, "")
      .replace(/\bin\s+([\w\s]+?)(?:\s+(?:and|or|for|from)|$)/gi, "")
      .replace(/\b(startup|startups|company|companies|brand|brands|agency|agencies|network|networks|lead|leads|prospect|prospects|business|businesses|firm|firms|client|clients)\b/gi, "")
      .trim() || "businesses";

    const leads = await findLeads({ industry, geo, count, category: "Network" });
    const summary = leads.length > 0
      ? `Found **${leads.length} leads** for "${industry}"${geo ? ` in ${geo}` : ""}. Adding them to your contacts now.`
      : `Couldn't find leads for "${industry}"${geo ? ` in ${geo}` : ""} — try a different search.`;
    return res.status(200).json({ message: summary, action: "find_leads", params: { leads, category: "Network" } });
  }

  try {
    const response = await callClaude(ANTHROPIC_KEY, valid, TOOLS);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    if (data.stop_reason === "tool_use") {
      const toolUse = data.content?.find(b => b.type === "tool_use");
      if (!toolUse) throw new Error("No tool_use block");

      const { name: toolName, id: toolId, input: toolInput } = toolUse;
      const prefixText = data.content?.find(b => b.type === "text")?.text || "";

      if (toolName === "find_leads") {
        const leads = await findLeads(toolInput);

        // Feed results back to Claude for a natural summary
        const followUpRes = await callClaude(ANTHROPIC_KEY, [
          ...valid,
          { role: "assistant", content: data.content },
          { role: "user", content: [{ type: "tool_result", tool_use_id: toolId, content: JSON.stringify(leads) }] },
        ], TOOLS);
        const followUpData = await followUpRes.json();
        const summary = followUpData.content?.find(b => b.type === "text")?.text
          || (leads.length > 0 ? `Found ${leads.length} leads in ${toolInput.industry}${toolInput.geo ? ` (${toolInput.geo})` : ""}. Adding them to your contacts now.` : "Couldn't find leads for that search. Try a different industry or region.");

        return res.status(200).json({
          message: summary,
          action: "find_leads",
          params: { leads, category: toolInput.category || "Network" },
        });
      }

      return res.status(200).json({
        message: prefixText || defaultMessage(toolName),
        action: toolName,
        params: toolInput,
      });
    }

    const message = data.content?.find(b => b.type === "text")?.text || "Got it!";
    return res.status(200).json({ message, action: "none", params: {} });

  } catch (err) {
    console.error("Chat error:", err.message);
    if (OPENAI_KEY) {
      try { return handleOpenAIFallback(res, messages, OPENAI_KEY); } catch {}
    }
    return res.status(200).json({ message: "Something went wrong — try again!", action: "none", params: {} });
  }
}
