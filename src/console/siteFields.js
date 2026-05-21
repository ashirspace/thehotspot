// In-app copy that flows through the useCms() c(key, fallback) helper.
// Defaults mirror the hardcoded fallbacks in App.jsx.

export const SITE_DEFAULTS = {
  hp_subtitle: "Your B2B outreach platform — find leads, write emails, run campaigns, and detect replies at scale.",
  hp_p1_title: "Lead Input",
  hp_p1_desc:  "Import leads from spreadsheets, connect CRM tools, or add contacts manually.",
  hp_p1_cta:   "Manage Contacts",
  hp_p2_title: "AI Engine",
  hp_p2_desc:  "GPT-4o-mini writes personalized outreach using templates and contact variables.",
  hp_p2_cta:   "Open Templates",
  hp_p3_title: "Outreach Channels",
  hp_p3_desc:  "Send emails via Gmail today. LinkedIn, WhatsApp, and SMS are on the roadmap.",
  hp_p3_cta:   "Send Emails",
  hp_p4_title: "Sequence / Campaign Manager",
  hp_p4_desc:  "Multi-step follow-up sequences that stop automatically when a reply is detected.",
  hp_p4_cta:   "View Campaigns",
  hp_p5_title: "Reply Detection & Inbox",
  hp_p5_desc:  "Detect and classify replies as interested, not interested, or out of office — automatically.",
  hp_p5_cta:   "Check Replies",
  cp_title:       "Contacts Database",
  cp_subtitle:    "Connect an existing data source or build your list from scratch.",
  cp_card1_title: "Connect Data Source",
  cp_card1_desc:  "Import contacts from tools you already use.",
  cp_card2_title: "Create New Database",
  cp_card2_desc:  "Start fresh with full control over your schema.",
  pp_section1_label: "Account Info",
  pp_section2_label: "Platform Stats",
  sp_title: "Settings",
};

const pillar = (n) => ({
  eyebrow: `Home — pillar ${n}`,
  fields: [
    { key: `hp_p${n}_title`, label: "Title", required: true },
    { key: `hp_p${n}_desc`,  label: "Description", multiline: true },
    { key: `hp_p${n}_cta`,   label: "Button label" },
  ],
});

export const SITE_SECTIONS = [
  { eyebrow: "Dashboard home", fields: [
    { key: "hp_subtitle", label: "Home subtitle", multiline: true, context: "dashboard home header" },
  ]},
  pillar(1), pillar(2), pillar(3), pillar(4), pillar(5),
  { eyebrow: "Contacts page", fields: [
    { key: "cp_title",       label: "Page title", required: true },
    { key: "cp_subtitle",    label: "Page subtitle", multiline: true },
    { key: "cp_card1_title", label: "Connect-source card title" },
    { key: "cp_card1_desc",  label: "Connect-source card text", multiline: true },
    { key: "cp_card2_title", label: "New-database card title" },
    { key: "cp_card2_desc",  label: "New-database card text", multiline: true },
  ]},
  { eyebrow: "Account pages", fields: [
    { key: "pp_section1_label", label: "Profile — section 1 label" },
    { key: "pp_section2_label", label: "Profile — section 2 label" },
    { key: "sp_title",          label: "Settings page title", required: true },
  ]},
];
