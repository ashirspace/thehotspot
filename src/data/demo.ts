import type { Campaign, InboxThread, Lead, SendingIdentity, SequenceStep, Template } from "../types";

export const leads: Lead[] = [
  {
    id: "lead-1",
    name: "Maya Rao",
    email: "maya@atlassian.com",
    company: "Atlassian",
    role: "VP Marketing",
    linkedinUrl: "https://linkedin.com/in/mayarao",
    status: "replied",
    validationStatus: "valid",
    enrichment: { signal: "Hiring SDRs in Bengaluru", source: "company news" },
  },
  {
    id: "lead-2",
    name: "Dev Kapoor",
    email: "dev@razorpay.com",
    company: "Razorpay",
    role: "Head of Growth",
    status: "contacted",
    validationStatus: "valid",
    enrichment: { signal: "Expanded APAC partnerships", source: "press release" },
  },
  {
    id: "lead-3",
    name: "Sara Lin",
    email: "sara@notion.so",
    company: "Notion",
    role: "Growth Lead",
    status: "booked",
    validationStatus: "valid",
    enrichment: { signal: "Launched new onboarding flow", source: "product update" },
  },
  {
    id: "lead-4",
    name: "Priya Nair",
    email: "priya@freshworks.com",
    company: "Freshworks",
    role: "CMO",
    status: "new",
    validationStatus: "risky",
    enrichment: { signal: "Role address risk check pending", source: "import" },
  },
];

export const campaigns: Campaign[] = [
  { id: "camp-1", name: "SaaS founders Q1", status: "active", sent: 1260, delivered: 1194, opened: 641, replied: 92, booked: 18 },
  { id: "camp-2", name: "Agency partner offers", status: "active", sent: 840, delivered: 803, opened: 411, replied: 61, booked: 12 },
  { id: "camp-3", name: "BD warm intros", status: "paused", sent: 320, delivered: 299, opened: 144, replied: 19, booked: 4 },
];

export const sendingIdentities: SendingIdentity[] = [
  {
    id: "sender-1",
    fromName: "Ashir Aryan",
    fromEmail: "ashir@thehotspot.in",
    provider: "gmail",
    dnsVerified: true,
    dailyLimit: 120,
    sentToday: 74,
    warmupStage: "healthy",
  },
  {
    id: "sender-2",
    fromName: "Partnerships",
    fromEmail: "partners@thehotspot.in",
    provider: "resend",
    dnsVerified: false,
    dailyLimit: 0,
    sentToday: 0,
    warmupStage: "blocked",
  },
];

export const sequenceSteps: SequenceStep[] = [
  { id: "step-1", type: "email", channel: "email", delayHours: 0, templateId: "tpl-1", label: "Initial value email" },
  { id: "step-2", type: "wait", channel: "email", delayHours: 72, label: "Wait 3 business days" },
  { id: "step-3", type: "email", channel: "email", delayHours: 0, templateId: "tpl-2", label: "Problem-led follow-up" },
  { id: "step-4", type: "wait", channel: "linkedin", delayHours: 96, label: "Wait 4 business days" },
  { id: "step-5", type: "dm", channel: "linkedin", delayHours: 0, templateId: "tpl-3", label: "Assisted LinkedIn DM" },
];

export const templates: Template[] = [
  {
    id: "tpl-1",
    name: "Founder intro",
    channel: "email",
    subject: "Quick idea for {{company}}",
    body: "Hi {{first_name}}, saw {{ai: summarize the strongest company signal in one sentence}}. We help teams turn that context into safe outbound sequences that stop the moment someone replies.",
    variables: ["first_name", "company", "ai"],
  },
  {
    id: "tpl-2",
    name: "Low-pressure follow-up",
    channel: "email",
    subject: "Worth a quick look?",
    body: "Hi {{first_name}}, wanted to follow up. If outbound quality or sender health is on your radar, I can send a short teardown for {{company}}.",
    variables: ["first_name", "company"],
  },
  {
    id: "tpl-3",
    name: "Assisted LinkedIn DM",
    channel: "linkedin",
    body: "Hi {{first_name}}, quick note after seeing your work at {{company}}. I had an idea for improving outbound reply quality without adding more reps. Open to me sending it over?",
    variables: ["first_name", "company"],
  },
];

export const inboxThreads: InboxThread[] = [
  {
    id: "thread-1",
    leadName: "Maya Rao",
    company: "Atlassian",
    channel: "email",
    intent: "interested",
    preview: "This is relevant. Can you send the deliverability checklist?",
    lastActivity: "4m ago",
  },
  {
    id: "thread-2",
    leadName: "Dev Kapoor",
    company: "Razorpay",
    channel: "email",
    intent: "pricing",
    preview: "Interested, but I need pricing and a quick security overview.",
    lastActivity: "19m ago",
  },
  {
    id: "thread-3",
    leadName: "Neha Bansal",
    company: "Zeta",
    channel: "linkedin",
    intent: "not_now",
    preview: "Not a priority this quarter. Circle back after July.",
    lastActivity: "1h ago",
  },
];
