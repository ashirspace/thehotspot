import { ArrowRight, BarChart3, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

const logos = ["Northstar", "Attic", "Layer", "Signal", "Tempo", "Lattice", "Fable", "Courier"];

const services = [
  ["Lead Discovery & Enrichment", "Find ideal prospects, normalize fields, dedupe records, and enrich each lead with useful business context.", "42 prospects matched"],
  ["AI Personalization", "Generate specific, reviewable copy from campaign context without inventing facts or fake familiarity.", "confidence 94%"],
  ["Sequence Orchestration", "Compose email, wait, follow-up, and assisted DM steps with reply and bounce stop conditions.", "Day 1 / 3 / 6"],
  ["Reply Detection", "Stop remaining steps automatically when a contact replies, unsubscribes, bounces, or enters suppression.", "reply detected"],
  ["Analytics", "Track sender health, delivery, opens, replies, booked meetings, and campaign-level performance.", "38% reply lift"],
];

const faqs = [
  ["Does thehotspot send LinkedIn DMs automatically?", "No. LinkedIn DM outreach is assisted and human-approved. The workspace can draft and track DMs, but it does not run headless browser automation."],
  ["Can I stop sends when someone replies?", "Yes. Reply, bounce, unsubscribe, suppression, and paused-campaign states are checked before every queued step."],
  ["Is AI copy sent without review?", "Low-confidence generations are flagged for review, and teams can keep approval gates on any campaign."],
  ["What happens if DNS is not verified?", "Campaign launch stays blocked until SPF, DKIM, and DMARC pass for the selected sender."],
  ["Can agencies manage client workspaces?", "Yes. Workspaces keep leads, campaigns, senders, messages, and analytics isolated by account."],
];

const principles = ["Specific beats generic", "Safety before scale", "Human approval matters", "Measure replies, not noise"];

const insightRows = [
  ["Sender health", "Verified", "SPF, DKIM, DMARC pass"],
  ["Suppression", "Active", "No duplicate outreach"],
  ["Approval gate", "On", "Low-confidence AI drafts wait"],
];

export function LandingPage() {
  return (
    <>
      <section className="hero-grid relative overflow-hidden border-b border-[var(--surface-border)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-14 pt-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8 lg:pb-16 lg:pt-28">
          <div className="max-w-3xl">
            <p className="precision-label flex items-center gap-3 text-[var(--teal-deep)]">
              <span className="h-px w-8 bg-[var(--teal)]" />
              Outreach automation · built for 2026
            </p>
            <h1 className="mt-6 max-w-4xl font-heading text-[clamp(3.5rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.03em] text-[var(--text-primary)]">
              Cold outreach that actually gets replies.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Import leads, generate personalized email copy, launch multi-step sequences, stop on replies or bounces,
              and manage every campaign from one workspace-secured dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/signup"><Button className="h-12 px-6">Start free trial <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/pricing" className="inline-flex h-12 items-center text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--teal-deep)]">
                Watch 2-min demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-[var(--surface-border)] text-sm text-[var(--text-secondary)]">
              {["No credit card", "14-day trial", "Setup in 3 min"].map((item) => (
                <span key={item} className="border-r border-[var(--surface-border)] py-4 last:border-r-0">{item}</span>
              ))}
            </div>
          </div>

          <div className="relative lg:pt-4">
            <div className="growth-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] bg-white px-5 py-4">
                <div>
                  <div className="text-sm font-semibold">Live campaign dashboard</div>
                  <div className="font-mono text-[0.72rem] text-[var(--text-tertiary)]">Workspace · Acme Growth</div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase text-[var(--teal-deep)]">
                  <span className="scheduler-dot h-2 w-2 rounded-full bg-[var(--teal)]" />
                  Live
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-[var(--surface-border)]">
                {[
                  ["Campaigns", "12"],
                  ["Sent", "847"],
                  ["Reply rate", "38%"],
                ].map(([label, value]) => (
                  <div key={label} className="border-r border-[var(--surface-border)] bg-[var(--surface-card)] p-5 last:border-r-0">
                    <div className="precision-label">{label}</div>
                    <div className="mt-3 text-[2.1rem] font-semibold tracking-[-0.04em]">{value}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 p-5">
                {[
                  ["M", "Maya Rao", "Can you send the deliverability checklist?"],
                  ["D", "Dev Kapoor", "Interested. Need pricing and a quick security overview."],
                  ["S", "Sara Lin", "This looks relevant for our partner campaigns."],
                ].map(([initial, name, copy]) => (
                  <div key={name} className="flex gap-3 rounded-md border border-[var(--surface-border)] bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--teal)] text-sm font-semibold text-white">{initial}</span>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--surface-border)] bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8 lg:items-center">
          <div className="precision-label text-[var(--text-tertiary)]">Trusted by teams at</div>
          <div className="logo-marquee">
            <div className="logo-marquee-track flex gap-12 whitespace-nowrap text-lg font-semibold text-[var(--text-tertiary)] opacity-75">
              {[...logos, ...logos].map((logo, index) => (
                <span key={`${logo}-${index}`} className="transition hover:text-[var(--text-primary)]">{logo}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="precision-label text-[var(--teal-deep)]">About</p>
          <h2 className="mt-5 max-w-xl font-heading text-[clamp(2rem,4vw,3.6rem)] leading-[1]">
            We built thehotspot to make cold outreach human again.
          </h2>
        </div>
        <div>
          <p className="text-base leading-8 text-[var(--text-secondary)]">
            Outreach breaks when teams chase volume without context. thehotspot gives operators a safer system:
            focused lead intake, reviewable AI, sender-health gates, and reply-first automation.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-[var(--surface-border)] py-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--teal-pale)] text-[var(--teal-deep)]">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold">Ashir Ayaan</div>
              <div className="text-sm text-[var(--text-secondary)]">Founder & CEO</div>
            </div>
          </div>
          <div className="mt-8 grid border-t border-[var(--surface-border)] sm:grid-cols-2">
            {principles.map((item) => (
              <div key={item} className="border-b border-[var(--surface-border)] p-5 first:pl-0 sm:[&:nth-child(odd)]:border-r">
                <h3 className="text-[1.05rem] font-semibold">{item}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">A practical operating principle built into the workflow.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product-overview" className="border-y border-[var(--surface-border)] bg-[var(--surface-raised)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="precision-label text-[var(--teal-deep)]">Product overview</p>
            <h2 className="mt-5 font-heading text-[clamp(2rem,4vw,3.7rem)] leading-[1]">
              Everything you need to run high-performing outreach.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-secondary)]">
              The dashboard keeps the funnel, deliverability, and AI review queue in the same operating rhythm.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="growth-panel p-6 md:col-span-2">
              <div className="flex items-center gap-3 text-[var(--teal-deep)]">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">AI personalization demo</h3>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Draft subject/body pairs from real campaign context, then block weak generations before they reach the queue.</p>
              <div className="mt-6 grid gap-3 rounded-md border border-[var(--surface-border)] bg-white p-4 font-mono text-[0.72rem] text-[var(--text-secondary)]">
                <span>{">"} ICP: B2B SaaS founders, 11-50 employees</span>
                <span>{">"} Reference: hiring outbound SDRs this quarter</span>
                <span className="text-[var(--teal-deep)]">{">"} output: approved draft · confidence 94%</span>
              </div>
            </div>
            <div className="growth-panel p-6">
              <BarChart3 className="h-5 w-5 text-[var(--teal-deep)]" />
              <h3 className="mt-5 text-[1.05rem] font-semibold">Campaign performance</h3>
              <div className="mt-5 flex h-28 items-end gap-2 rounded-md border border-[var(--surface-border)] bg-white p-3">
                {[42, 68, 51, 86, 74, 96, 82].map((height, index) => (
                  <div key={index} className="w-full rounded-sm" style={{ height, backgroundColor: "rgba(13, 148, 136, 0.8)" }} />
                ))}
              </div>
            </div>
            <div className="growth-panel p-6">
              <ShieldCheck className="h-5 w-5 text-[var(--teal-deep)]" />
              <h3 className="mt-5 text-[1.05rem] font-semibold">Actionable insights</h3>
              <div className="mt-5 grid gap-3">
                {insightRows.map(([label, status, detail]) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] gap-2 border-b border-[var(--surface-border)] pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="font-mono text-[0.7rem] uppercase text-[var(--teal-deep)]">{status}</span>
                    <span className="col-span-2 text-sm text-[var(--text-secondary)]">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="growth-panel p-6 md:col-span-2">
              <h3 className="text-[1.05rem] font-semibold">Intelligent sequences</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Day 1 · value email", "Day 3 · wait + check", "Day 6 · assisted DM"].map((step) => (
                  <div key={step} className="border-l-[3px] border-[var(--teal)] bg-white p-4 font-mono text-[0.72rem] text-[var(--text-secondary)]">{step}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-provide" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="precision-label text-[var(--teal-deep)]">What we provide</p>
        <div className="mt-8 border-b border-[var(--surface-border)]">
          {services.map(([title, copy, visual], index) => (
            <div key={title} className="service-row grid gap-6 border-t border-[var(--surface-border)] py-8 md:grid-cols-[92px_minmax(0,1fr)_240px]">
              <div className="font-heading text-5xl italic leading-none text-[var(--surface-border-strong)]">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <h3 className="text-[1.08rem] font-semibold">{title}</h3>
                <p className="mt-2 max-w-2xl text-[0.9375rem] leading-[1.65] text-[var(--text-secondary)]">{copy}</p>
              </div>
              <div className="rounded-md border border-[var(--surface-border)] bg-[var(--teal-pale)]/45 p-4 font-mono text-[0.72rem] text-[var(--teal-deep)]">{visual}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="growth-panel grid gap-6 p-6 sm:grid-cols-[1fr_220px]">
            <div>
              <p className="precision-label text-[var(--teal-deep)]">Featured report</p>
              <h2 className="mt-4 font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1]">The 2026 cold email benchmark report</h2>
              <p className="mt-3 font-mono text-[0.72rem] text-[var(--text-tertiary)]">Jan 2026 · 12 min read</p>
            </div>
            <div className="flex items-end gap-3 rounded-md border border-[var(--surface-border)] bg-white p-4">
              {[42, 68, 51, 86, 74].map((height, index) => (
                <div key={index} className="w-full rounded-sm" style={{ height, backgroundColor: "rgba(13, 148, 136, 0.8)" }} />
              ))}
            </div>
          </div>
          <div className="grid border-t border-[var(--surface-border)] sm:grid-cols-2 lg:grid-cols-1">
            {["FAQ", "Glossary", "Changelog", "Security notes"].map((item) => (
              <Link key={item} to="/blog" className="group flex items-center justify-between border-b border-[var(--surface-border)] py-5 text-sm font-semibold">
                {item}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1]">Questions operators ask before launch.</h2>
        <div className="mt-8 border-t border-[var(--surface-border)]">
          {faqs.map(([question, answer]) => (
            <details key={question} className="faq-row border-b border-[var(--surface-border)] py-5">
              <summary className="flex cursor-pointer list-none items-center gap-4 text-[1.05rem] font-medium">{question}</summary>
              <p className="mt-4 max-w-3xl text-[0.9375rem] leading-[1.65] text-[var(--text-secondary)]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer-dark px-4 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl py-20 text-center lg:py-24">
            <h2 className="font-sans text-[clamp(3rem,7vw,5.8rem)] font-bold leading-[0.98] tracking-[-0.02em] text-white">
              Stop sending emails into the void.
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/58">
              Launch your first campaign today and watch the replies come in by the end of the week.
            </p>
            <Link to="/signup" className="mt-8 inline-flex">
              <Button className="h-14 min-w-44 border border-white/55 px-7 text-base shadow-none">Start free trial</Button>
            </Link>
            <p className="mt-7 text-sm text-white/28">No credit card · Cancel anytime · 14-day trial</p>
          </div>

          <div className="grid gap-10 border-b border-white/10 pb-14 pt-20 lg:grid-cols-[1fr_auto] lg:items-start">
            <h2 className="max-w-xl font-sans text-[clamp(2.5rem,5vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.02em] text-white">
              Ready to grow connections?
            </h2>
            <Link to="/signup" className="inline-flex items-center gap-2 pt-3 text-lg font-medium text-white/70 transition hover:text-white">
              Start free trial <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-12 py-12 lg:grid-cols-[1.25fr_2fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-[-0.02em] text-white">
                <img src="/brand/thehotspot-logo.png" alt="" className="h-9 w-[30px] object-contain" />
                thehotspot
              </Link>
              <p className="mt-6 max-w-xs text-base leading-7 text-white/48">
                AI-powered cold outreach automation for modern sales teams.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-3">
              {[
                ["Product", "Features", "Pricing", "Changelog", "Roadmap"],
                ["Company", "About", "Blog", "Careers", "Contact"],
                ["Legal", "Privacy", "Terms", "Security", "GDPR"],
              ].map(([heading, ...links]) => (
                <div key={heading}>
                  <div className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/38">{heading}</div>
                  <div className="mt-6 grid gap-4 text-base text-white/52">
                    {links.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 py-8 text-sm text-white/34 md:grid-cols-2 md:items-center">
            <span>© 2026 thehotspot · All rights reserved</span>
            <div className="flex gap-6 md:justify-end">
              <span>X</span>
              <span>in</span>
              <span>GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
