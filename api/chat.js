export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) return res.status(500).json({ error: "API key not configured" });

  try {
    const systemPrompt = `You are thehotspot's Outreach Assistant — a multilingual AI that helps users manage email outreach campaigns. You understand and respond in Hindi, English, Hinglish, Urdu, and any language the user speaks. Match the user's language naturally.

You control an N8N-based email outreach automation system. You can help with:
- Sending outreach emails (by category: Network, CPS, CPL, CPA, Mobile, or all)
- Checking campaign stats and status
- Pausing/resuming outreach workflows
- Adding/removing contacts from the database
- Modifying email templates by category
- Scheduling campaigns
- Answering questions about the platform

Be concise, friendly, and professional. Keep responses short and helpful.
If you identify an actionable command, include at the end: <action>{"type":"send_emails","category":"Network"}</action>
Action types: send_emails, add_contact, pause_workflow, resume_workflow, show_stats, change_template`;

    // Build conversation for Gemini
    const validMsgs = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
    const firstUserIdx = validMsgs.findIndex(m => m.role === "user");
    const cleanMsgs = firstUserIdx >= 0 ? validMsgs.slice(firstUserIdx) : validMsgs;

    const geminiMessages = cleanMsgs.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, couldn't process that.";

    // Return in same format so frontend works without changes
    res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Gemini API" });
  }
}
