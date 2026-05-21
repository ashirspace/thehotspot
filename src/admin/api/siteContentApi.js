import { fetchContent, saveContent } from "../../console/api/contentApi.js";

export { fetchContent, saveContent };

export const LANDING_DEFAULTS = {
  // Announcement Bar
  announcement_text:     "Now in Beta — Join 500+ companies growing with thehotspot →",
  announcement_link:     "https://thehotspot.in",
  show_announcement:     "true",

  // Hero Section
  hero_eyebrow:          "OUTREACH AUTOMATION · BUILT FOR 2026",
  hero_headline_line1:   "Cold outreach that",
  hero_headline_accent:  "gets replies",
  hero_subheadline:      "Automated email campaigns powered by AI personalization. Find leads, write emails, send at scale, and detect replies — all from one dashboard.",
  hero_social_proof:     "Trusted by 500+ teams · 4.9 ★ on Product Hunt",
  hero_cta_primary:      "Start free trial",
  hero_cta_secondary:    "Watch 2-min demo →",
  hero_disclaimer:       "No credit card · 14-day trial · Setup in 3 min",

  // Features Section
  features_eyebrow:      "FEATURES",
  features_headline:     "Everything you need to run outreach that converts.",
  features_subheadline:  "From the first draft to the booked meeting, thehotspot handles the work.",
  feature_01_title:      "AI that writes like you, not like a robot",
  feature_01_desc:       "Every email is personalized from real signals — company news, role, and timing.",
  feature_02_title:      "Replies land in one inbox",
  feature_02_desc:       "Track opens and responses across every campaign in a single unified view.",
  feature_03_title:      "Segment by what matters",
  feature_03_desc:       "Tag and target by industry, role, or stage.",
  feature_04_title:      "Send at scale, safely",
  feature_04_desc:       "Warm-up and throttling keep you out of spam.",
  feature_05_title:      "See every campaign as a pipeline",
  feature_05_desc:       "Move cohorts from queued to replied with full visibility.",
  feature_06_title:      "Schedule around time zones",
  feature_06_desc:       "Emails arrive when prospects are at their desks.",

  // Stats
  stat_01_number:        "500+",
  stat_01_label:         "Campaigns launched",
  stat_02_number:        "98%",
  stat_02_label:         "Delivery rate",
  stat_03_number:        "40+",
  stat_03_label:         "Industries served",
  stat_04_number:        "3 min",
  stat_04_label:         "Avg setup time",

  // Testimonial
  testimonial_quote:     "We switched from a legacy tool and our reply rate jumped from 2% to 11% in the first month. The AI personalization is genuinely different.",
  testimonial_name:      "Priya Verma",
  testimonial_role:      "Head of Growth",
  testimonial_company:   "Lumina Labs",

  // Pricing
  plan_01_name:          "Starter",
  plan_01_price:         "0",
  plan_01_desc:          "For founders sending their first campaigns.",
  plan_01_features:      "200 emails/mo\n1 inbox\nAI drafts\nDelivery tracking",
  plan_01_cta:           "Start free",
  plan_02_name:          "Growth",
  plan_02_price:         "49",
  plan_02_desc:          "For SDRs and small teams scaling outreach.",
  plan_02_features:      "10K emails/mo\n5 inboxes\nAI personalization\nWarm-up included\nAdvanced analytics",
  plan_02_cta:           "Start free trial",
  plan_03_name:          "Scale",
  plan_03_price:         "149",
  plan_03_desc:          "For agencies running outreach at volume.",
  plan_03_features:      "Unlimited emails\nUnlimited inboxes\nDedicated account manager\nCustom roles\nPriority support",
  plan_03_cta:           "Talk to sales",

  // Footer
  footer_tagline:        "AI-powered cold outreach automation for modern sales teams.",
  footer_copyright:      "© 2026 Ibra Digitals · All rights reserved",
  footer_made_in:        "Made with care in India",
  footer_cta_heading:    "Ready to grow connections?",
  footer_cta_btn:        "Start free trial →",
};

// Login defaults re-exported from loginFields for convenience
export { LOGIN_DEFAULTS } from "../../console/loginFields.js";

export const fetchLandingContent = () => fetchContent("landing");
export const saveLandingContent  = (data, updatedBy) => saveContent("landing", data, updatedBy);

export const fetchLoginContent = () => fetchContent("login");
export const saveLoginContent  = (data, updatedBy) => saveContent("login", data, updatedBy);
