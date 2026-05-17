import axios from "axios";

export async function askClaude(systemPrompt, userMessage, maxTokens = 1200) {
  const res = await axios.post("/api/chat", {
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
    max_tokens: maxTokens,
  });
  return res.data.content?.[0]?.text || res.data.reply || res.data.message || "";
}
